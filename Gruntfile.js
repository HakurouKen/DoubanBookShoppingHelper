module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		uglify:{
			dist:{
				files:{
					'content_script.min.js':['content_script.js']
				}
			}
		},
		sass:{
			dist:{
				files:[
					{
						expand: true,
						cwd: 'src/style',
						src: '*.scss',
						dest: 'dist/style',
						ext: '.css'
					}
				]
			}
		},
		cssmin: {
			minify: {
				expand: true,
				cwd: 'dist/style/',
				src: ['*.css','!*.min.css'],
				dest: 'dist/style/',
				ext: '.min.css'
			}
		},
		copy:{
			dist:{
				files:[
					{
						expand: true,
						cwd: 'src/template',
						src: '*.js',
						dest: 'dist/template',
						ext: '.tpl'
					}
				]
			}
		},
		watch:{
			style: {
				files: ['src/style/*.scss'],
				tasks: ['sass','cssmin']
			},
			template: {
				files: ['src/template/*.js'],
				tasks: ['copy']
			},
			uglify:{
				files: ['content_script.js'],
				tasks: ['uglify']
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.registerTask('default',['sass','copy','uglify','cssmin','watch']);
}