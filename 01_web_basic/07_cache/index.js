const express = require('express');

const cacheableImage = express();
cacheableImage.use(express.static('cacheable'));
cacheableImage.listen(8080);

const nonCacheableImage = express();
nonCacheableImage.use(express.static('non_cacheable', { etag: false, lastModified: false }));
nonCacheableImage.listen(8081);
