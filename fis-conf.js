// 解析less
fis.match('**.less', {
	parser: 'less',
	rExt: '.css'
})
// 解析jsx
fis.match('**.jsx', {
	parser: 'babel2',
	rExt: '.js'
})