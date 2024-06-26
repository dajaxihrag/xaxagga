
const express = require('express')
const path = require("path");
const app = express()

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
}
app.use(express.static('build', options))

const port = process.env.PORT || 3000
app.use('/static', express.static(path.join(__dirname, '/build/static')));
app.get('*', function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, '/build/')});
});
app.listen(port, () => {
  console.log(`React app listening at http://localhost:${port}`)
})