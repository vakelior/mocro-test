/**
 * MOCRO — api.js | central data-access layer (wraps supabase-js).
 */
(function () {
  'use strict';
  var cfg = window.MOCRO_CONFIG;
  var sb = null;
  function getClient() {
    if (!sb) {
      if (!window.supabase || !window.supabase.createClient) throw new Error('supabase-js not loaded');
      sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON);
    }
    return sb;
  }

  var ARTICLE_SELECT =
    'id,title,slug,excerpt,content,featured_image,category_id,author_id,status,is_featured,is_breaking,views,published_at,created_at,updated_at,' +
    'categories(id,name,slug,image),authors(id,name,slug,avatar,bio),article_tags(tags(id,name,slug))';

  function normalize(a) {
    if (!a) return null;
    return {
      id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt || '', content: a.content || '',
      featured_image: a.featured_image || '', category: a.categories || null, category_id: a.category_id,
      author: a.authors || null, author_id: a.author_id,
      tags: (a.article_tags || []).map(function (t) { return t.tags; }).filter(Boolean),
      status: a.status, is_featured: !!a.is_featured, is_breaking: !!a.is_breaking,
      views: a.views || 0, published_at: a.published_at, created_at: a.created_at, updated_at: a.updated_at
    };
  }

  window.Mocro = {
    client: getClient,
    normalize: normalize,
    listCategories: function () {
      return getClient().from('categories').select('id,name,slug,description,image,sort_order')
        .eq('is_active', true).order('sort_order', { ascending: true });
    },
    latestArticles: function (limit) {
      return getClient().from('articles').select(ARTICLE_SELECT).eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false }).limit(limit || 12);
    },
    featuredArticles: function (limit) {
      return getClient().from('articles').select(ARTICLE_SELECT).eq('status', 'published')
        .eq('is_featured', true).order('published_at', { ascending: false, nullsFirst: false }).limit(limit || 6);
    },
    popularArticles: function (limit) {
      return getClient().from('articles').select('id,title,slug,excerpt,featured_image,views,published_at,categories(id,name,slug)')
        .eq('status', 'published').order('views', { ascending: false }).limit(limit || 6);
    },
    breakingArticles: function (limit) {
      return getClient().from('articles').select('id,title,slug,published_at').eq('status', 'published')
        .eq('is_breaking', true).order('published_at', { ascending: false, nullsFirst: false }).limit(limit || 8);
    },
    articleBySlug: function (slug) {
      return getClient().from('articles').select(ARTICLE_SELECT).eq('slug', slug).eq('status', 'published').maybeSingle();
    },
    articlesByCategory: async function (slug, limit) {
      var c = await getClient().from('categories').select('id').eq('slug', slug).maybeSingle();
      if (!c.data) return { data: [], error: c.error };
      return getClient().from('articles').select(ARTICLE_SELECT).eq('category_id', c.data.id).eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false }).limit(limit || 50);
    },
    articlesByAuthor: async function (slug, limit) {
      var a = await getClient().from('authors').select('id').eq('slug', slug).maybeSingle();
      if (!a.data) return { data: [], error: a.error };
      return getClient().from('articles').select(ARTICLE_SELECT).eq('author_id', a.data.id).eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false }).limit(limit || 50);
    },
    categoryBySlug: function (slug) {
      return getClient().from('categories').select('id,name,slug,description,image,sort_order').eq('slug', slug).eq('is_active', true).maybeSingle();
    },
    authorBySlug: function (slug) {
      return getClient().from('authors').select('id,name,slug,avatar,bio,social_links').eq('slug', slug).maybeSingle();
    },
    relatedArticles: async function (article, limit) {
      var n = limit || 4;
      // 1) try same-category articles first (excluding current)
      if (article && article.category_id) {
        var same = await getClient().from('articles').select(ARTICLE_SELECT)
          .eq('status', 'published').neq('id', article.id)
          .eq('category_id', article.category_id)
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(n);
        if (same.data && same.data.length) return same;
        if (same.error) return same;
      }
      // 2) fall back to latest published articles across all categories
      return getClient().from('articles').select(ARTICLE_SELECT)
        .eq('status', 'published').neq('id', article.id)
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(n);
    },
    search: function (query, limit) {
      var q = getClient().from('articles').select('id,title,slug,excerpt,featured_image,published_at,categories(id,name,slug)').eq('status', 'published');
      if (query) q = q.or('title.ilike.%' + query + '%,excerpt.ilike.%' + query + '%,content.ilike.%' + query + '%');
      return q.order('published_at', { ascending: false, nullsFirst: false }).limit(limit || 30);
    },
    incrementView: function (slug) {
      return getClient().rpc('increment_article_view_by_slug', { p_slug: slug });
    },
    onBreakingChange: function (cb) {
      return getClient().channel('breaking-news')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'articles', filter: 'is_breaking=eq.true' }, function () { if (cb) cb(); })
        .subscribe();
    }
  };
})();
