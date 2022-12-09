/* global TimelineJS */
/**
 * Init a H5P object.
 **/
 var H5P = H5P || {};
/**
 *
 * @param object params
 *  The object defined in content.json
 * @param int contentId
 *  The nodes vid
 */
 H5P.TimelinePapiJo = (function ($) {

  function C(options, contentId) {
    var self = this;
    var i;
    this.options = $.extend(true, {}, {
      timeline: {
        type: 'default',
        defaultZoomLevel: 0,
        language: 'en',
        height: 600
      }
    }, options);

    // Need to create the URL for all H5P.Images
    // Detect potential asset for front page.
    
    if (Object.keys(this.options.timeline.asset).length !== 0) {
      let media = this.options.timeline.asset.media;
      
      let type = media.library.split(' ')[0];
    
      if (type === 'H5P.Image' && media.params.file) {
        this.options.timeline.asset.media = H5P.getPath(media.params.file.path, contentId);
      }
      else if (type === 'H5P.Video' && media.params.sources) {
        this.options.timeline.asset.media = H5P.getPath(media.params.sources[0].path, contentId);
        console.log('this.options.timeline.asset.media ' + this.options.timeline.asset.media);
        }
        else {
          this.options.timeline.asset.media = '';
          }
    }
    // Detect potential assets for dates pages.
    if (this.options.timeline.date !== undefined) {
      var dates = this.options.timeline.date;
      for (i = 0; i < dates.length; i++) {
        if (dates[i].asset.thumbnail !== undefined) {
          dates[i].asset.thumbnail = H5P.getPath(dates[i].asset.thumbnail.path, contentId);
        }
        if (dates[i].asset.media !== undefined && dates[i].asset.media !== '') {
          let media = dates[i].asset.media;
          let type = media.library.split(' ')[0];
            console.log('type = ' + type);
          if (type === 'H5P.Image') {
            if (media.params.file) {
              dates[i].asset.media = H5P.getPath(media.params.file.path, contentId);
            }
          }
          else if (type === 'H5P.Video') {
            if (media.params.sources) {
              dates[i].asset.media = H5P.getPath(media.params.sources[0].path, contentId);
              console.log('dates[i].asset.media = ' + dates[i].asset.media);
            }
          }
        }
      }
    }
    // Check if eras are legal - if not, remove them!
    if (this.options.timeline.era !== undefined) {
      for (i=this.options.timeline.era.length-1; i >= 0; i--) {
        if(this.options.timeline.era[i].startDate === undefined || this.options.timeline.era[i].endDate === undefined) {
          this.options.timeline.era.splice(i,1);
        }
      }
    }

    /**
     * Set background image
     * @method setBackgroundImage
     * @param  {Object}           image Image object as part of H5P content jeson
     */
    self.setBackgroundImage = function (image) {
      
      // Need to wait for timelinejs to be finished
      setTimeout(function () {
        var $slider = self.$container.find('.vco-slider');
        if ($slider.length !== 0) {
          $slider.css('background-image', 'url(' + H5P.getPath(image.path, contentId) + ')');
        }
        else {
          self.setBackgroundImage(image);
        }
      }, 200);
    };

    self.on('enterFullScreen', function () {
      self.$container.css('height', '100%');
      $(window).trigger('resize');
    });

    self.on('exitFullScreen', function () {
      self.$container.css('height', self.options.timeline.height + 'px');
      $(window).trigger('resize');
    });
  }

  /**
   * Check if data provided is valid.
   * @method validate
   * @return {boolean} Valid or not
   */
  C.prototype.validate = function () {
    if (this.options.timeline.date === undefined || this.options.timeline.date.length === 0) {
      return false;
    }

    for (var i = 0; i < this.options.timeline.date.length; i++) {
      var element = this.options.timeline.date[i];
      if (element.startDate === undefined || element.headline === undefined) {
        return false;
      }
    }

    return true;
  };

  /**
   * Attatch the Timeline HTML to a given target.
   **/
  C.prototype.attach = function ($container) {
    var self = this;

    self.$container = $container;
    $container.addClass('h5p-timeline').css('height', self.options.timeline.height + 'px');
    $container.append($('<div>', {id: 'h5p-timeline'}));

    // Need to set this to make timeline behave correctly:
    window.jQuery = $;

    if (self.validate()) {
      pp = self.getLibraryFilePath('H5P.TimelinePapiJo');
      console.log('**************** pp = ' + pp);
      
      
            path = '/drupal7dev/sites/default/files/h5p/development/h5p-timeline-papijo/library.json';
                  console.log('path = ' + path);

    $.getJSON(self.getLibraryFilePath('library.json'), function (data) {
//  $.getJSON(path, function (data) {
        new TimelineJS({
          type: 'timeline',
          width: '100%',
          height: '100%',
          source: self.options,
          lang: self.options.timeline.language,
          start_zoom_adjust: self.options.timeline.defaultZoomLevel,
          embed_id: 'h5p-timeline'
        }, data.preloadedDependencies[0].majorVersion, data.preloadedDependencies[0].minorVersion);

      
        // Add background image if any:
        if (self.options.timeline.backgroundImage !== undefined) {
          self.setBackgroundImage(self.options.timeline.backgroundImage);
        }
      });
    }
    else {
      $container.append($('<div>', {
        html: 'Missing mandatory data - not able to draw the timeline. Please open this H5P in the editor, and make the necessary changes.',
        'class': 'h5p-timeline-data-not-valid'
      }));
    }
  };

  return C;
 })(H5P.jQuery);
