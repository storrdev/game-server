module.exports = function(grunt) {

  grunt.initConfig({
    jsdoc2md: {
      oneOutputFile: {
        src: 'lib/js/game-server.js',
        dest: 'docs/Home.md'
      }
    },
    jshint: {
      files: [
        'Gruntfile.js',
        'app.js',
        'lib/**/*.js'
      ],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'jsdoc2md']
    }
  });

  grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'jsdoc2md', 'watch']);

};