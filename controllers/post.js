/**
 * GET /contact
 */
exports.postGet = function(req, res) {
  res.render('post', {
    title: 'Post A Tree'
  });
};


