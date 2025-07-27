function encode(str) {
  return Buffer.from(str).toString('base64');
}

console.log(encode('1946326672:AAEwXYJ0QjXFKcpKMmlYD0V7-3TcFs_tcSA'))
function decode(str) {
  return Buffer.from(str, 'base64').toString('ascii');
}

module.exports = { encode, decode };