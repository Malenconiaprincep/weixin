/*global module:false*/

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    stylus: {
      'dist/css/**.css': ['static/stylus/**/main.styl']
    },

    cssmin: {
      compress: {
        files: {
          'dist/css/**.min.css': ['dist/css/**.css']
        }
      }
    },

    watch: {
      stylesheets: {
        files: [
          'static/stylus/**/*.styl',
          'static/modules/**/*.styl'
        ],
        tasks: ['stylus', 'cssmin']
      },
      scripts: {
        files: ['static/js/*.js',
          'static/js/**/*.js',
          'static/modules/**/*.js'
        ],
        tasks: ['ozma']
      },
      genstatic: {
        files: [
          'views/*.jade',
          'views/**/*.jade',
          'static/modules/**/*'
        ],
        tasks: ['genstatic', 'jade']
      }
    },
    jade: {
      site: {
        files: {
          'dist/template/': ['static/views/*.jade', 'static/modules/**/*.jade']
        }
      },
      options: {
        basePath: 'static'
      }
    },
    uglify: {
      site: {
        files: {
          'dist/js/**.min.js': ['dist/js/**/main.js']
        }
      }
    },

    ozma: {
      index: {
        src: 'static/js/index/main.js',
        saveConfig: false,
        debounceDelay: 3000,
        config: {
          baseUrl: "static/",
          distUrl: "dist/",
          loader: "js/libs/oz.js",
          disableAutoSuffix: true
        }
      }
    },
    genstatic: {
      index: {
        file: 'views/index.jade',
        modulePath: 'static/modules',
        prefix: {
          js: 'modules',
          stylesheet: '../../modules'
        },
        dest: {
          js: 'static/js/index/modules.js',
          stylesheet: 'static/stylus/index/modules.styl'
        }
      },
      options: {
        copy: ['image', 'fonts', 'externals']
      }
    }
  });

  grunt.loadNpmTasks('grunt-private-ozjs');
  grunt.loadNpmTasks('private-grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('private-grunt-contrib-stylus');
  grunt.loadNpmTasks('private-grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-genstatic');
  grunt.loadNpmTasks('grunt-jade-runtime');
  grunt.loadNpmTasks('grunt-qns-newmodule');

  // By default, lint and run all tests.
  grunt.registerTask('default', ['watch']);

  grunt.registerTask('build', ['genstatic', 'stylus', 'ozma', 'cssmin', 'uglify', 'jade']);
};