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
    if (Object.keys(this.options.timeline.asset).length !== 0) {
      this.options.timeline.text = self.justify(this.options.timeline.text);
      // Detect potential asset for front page.
      if (this.options.timeline.asset.mediaselect !== undefined) {
        this.options.timeline.asset.credit = this.options.timeline.asset.info.credit;
        this.options.timeline.asset.caption = this.options.timeline.asset.info.caption;
        if (this.options.timeline.asset.mediaselect === 'img') {
          if (this.options.timeline.asset.image !== undefined && this.options.timeline.asset.image !== '') {
            if (this.options.timeline.asset.image.path) {
              this.options.timeline.asset.media = H5P.getPath(this.options.timeline.asset.image.path, contentId);
            }
          }
        }
        else if (this.options.timeline.asset.webmedia !== undefined) {
            this.options.timeline.asset.media = this.options.timeline.asset.webmedia;
        }
      }
    }
    // Detect potential assets for dates pages.
    if (this.options.timeline.date !== undefined) {
      var dates = this.options.timeline.date;
      for (i = 0; i < dates.length; i++) {
        dates[i].text = self.justify(dates[i].text);
        if (dates[i].asset.thumbnail !== undefined) {
          dates[i].asset.thumbnail = H5P.getPath(dates[i].asset.thumbnail.path, contentId);
        }
        if (dates[i].asset.mediaselect !== undefined) {
          dates[i].asset.credit = dates[i].asset.info.credit;
          dates[i].asset.caption = dates[i].asset.info.caption;
          if (dates[i].asset.mediaselect === 'img') {
            if (dates[i].asset.image !== undefined && dates[i].asset.image !== '') {
              if (dates[i].asset.image.path) {
                dates[i].asset.media = H5P.getPath(dates[i].asset.image.path, contentId);
              }
            }
          }
          else if (dates[i].asset.webmedia !== undefined) {
            dates[i].asset.media = dates[i].asset.webmedia;
          }
        }
      }
    }
    // Check if eras are legal - if not, remove them!
    if (this.options.timeline.era !== undefined) {
      for (i = this.options.timeline.era.length - 1; i >= 0; i--) {
        if (this.options.timeline.era[i].startDate === undefined || this.options.timeline.era[i].endDate === undefined) {
          this.options.timeline.era.splice(i, 1);
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
      $.getJSON(self.getLibraryFilePath('library.json'), function (data) {
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

  /**
   * Replace text-align: right with text-align: justify. 
   * Because text-align: justify is not available in H5P text editor and I find align right plain ugly!
   * @method justify
   * @return {string}
   */
  C.prototype.justify = function (str) {
        const regex = /text-align: right;/gm;
        const subst = 'text-align: justify;';
        nbMatches = ((str || '').match(regex) || []).length;
        if (nbMatches !== 0) {
          str = str.replace(regex, subst);
        }        
    return str;
  };

  return C;
})(H5P.jQuery);
