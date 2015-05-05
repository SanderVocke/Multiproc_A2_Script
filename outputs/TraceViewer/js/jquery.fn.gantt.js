// jQuery Gantt Chart
// ==================

// Basic usage:

//      $(".selector").gantt({
//          source: "ajax/data.json",
//          scale: "weeks",
//          minScale: "weeks",
//          maxScale: "months",
//          onItemClick: function(data) {
//              alert("Item clicked - show some details");
//          },
//          onAddClick: function(dt, rowId) {
//              alert("Empty space clicked - add an item!");
//          },
//          onRender: function() {
//              console.log("chart rendered");
//          }
//      });

//
/*jshint shadow:true, unused:false, laxbreak:true, evil:true*/
/*globals jQuery, alert*/
(function ($) {

    "use strict";

    $.fn.gantt = function (options) {

        var cookieKey = "jquery.fn.gantt";
        //var scales = ["hours", "days", "weeks", "months"];
        
		var minScale = 1;
		var maxScale = 100000;
		var timeLabel = "&micro;s";
        //Default settings
        var settings = {
            source: null,
            itemsPerPage: 8,
            startPos: 0,
            navigate: "buttons",
            scale: minScale,
            useCookie: false,
            maxScale: maxScale,
            minScale: minScale,
            waitText: "Please wait...",
            onItemClick: function (data) { return; },
            onAddClick: function (data) { return; },
            onRender: function() { return; },
			timeLabel: timeLabel
        };

        // Grid management
        // ===============

        // Core object is responsible for navigation and rendering
        var core = {
            // Return the element whose topmost point lies under the given point
            // Normalizes for IE
            elementFromPoint: function (x, y) {

                if ($.browser.msie) {
                    x -= $(document).scrollLeft();
                    y -= $(document).scrollTop();
                } else {
                    x -= window.pageXOffset;
                    y -= window.pageYOffset;
                }

                return document.elementFromPoint(x, y);
            },

            // **Create the chart**
            create: function (element) {

                // Initialize data with a json object or fetch via an xhr
                // request depending on `settings.source`
                if (typeof settings.source !== "string") {
                    element.data = settings.source;
                    core.init(element);
                } else {
                    $.getJSON(settings.source, function (jsData) {
                        element.data = jsData;
                        core.init(element);
                    });
                }
            },

            // **Setup the initial view**
            // Here we calculate the number of rows, pages and visible start
            // and end timestamps once the data is ready
            init: function (element) {
                element.rowsNum = element.data.length;
                element.pageCount = Math.ceil(element.rowsNum / settings.itemsPerPage);
                element.rowsOnLastPage = element.rowsNum - (Math.floor(element.rowsNum / settings.itemsPerPage) * settings.itemsPerPage);

                element.timestampStart = tools.getMinTimestamp(element);
                element.timestampEnd = tools.getMaxTimestamp(element);


                /* core.render(element); */
                core.waitToggle(element, true, function () { core.render(element); });
            },

            // **Render the grid**
            render: function (element) {
                var content = $('<div class="fn-content"/>');
                var $leftPanel = core.leftPanel(element);
                content.append($leftPanel);
                var $rightPanel = core.rightPanel(element, $leftPanel);
                var mLeft, hPos;

                content.append($rightPanel);
                content.append(core.navigation(element));

                var $dataPanel = $rightPanel.find(".dataPanel");

                element.gantt = $('<div class="fn-gantt" />').append(content);

                $(element).html(element.gantt);
				
                element.scrollNavigation.panelMargin = parseInt($dataPanel.css("margin-left").replace("px", ""), 10);
                element.scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());
                element.scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());

                core.markNow(element);
                core.fillData(element, $dataPanel, $leftPanel);

                // Set a cookie to record current position in the view
                if (settings.useCookie) {
                    var sc = $.cookie(this.cookieKey + "ScrollPos");
                    if (sc) {
                        element.hPosition = sc;
                    }
                }

				if ((element.hPosition !== 0)) {
					if (element.scaleOldWidth) {
						mLeft = ($dataPanel.width() - $rightPanel.width());
						hPos = mLeft * element.hPosition / element.scaleOldWidth;
						hPos = hPos > 0 ? 0 : hPos;
						$dataPanel.css({ "margin-left": hPos + "px" });
						element.scrollNavigation.panelMargin = hPos;
						element.hPosition = hPos;
						element.scaleOldWidth = null;
					} else {
						$dataPanel.css({ "margin-left": element.hPosition + "px" });
						element.scrollNavigation.panelMargin = element.hPosition;
					}
					core.repositionLabel(element);
				} else {
					core.repositionLabel(element);
				}
			

                $dataPanel.css({ height: $leftPanel.height() });
                core.waitToggle(element, false);
                settings.onRender();
            },

            // Create and return the left panel with labels
            leftPanel: function (element) {
                /* Left panel */
                var ganttLeftPanel = $('<div class="leftPanel"/>')
                    .append($('<div class="row spacer"/>')
                    .css("height", tools.getCellSize() * element.headerRows + "px")
                    .css("width", "100%"));

                var entries = [];
                $.each(element.data, function (i, entry) {
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {
                        entries.push('<div class="row name row' + i + (entry.desc ? '' : ' fn-wide') + '" id="rowheader' + i + '" offset="' + i % settings.itemsPerPage * tools.getCellSize() + '">');
                        entries.push('<span class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.name + '</span>');
                        entries.push('</div>');

                        if (entry.desc) {
                            entries.push('<div class="row desc row' + i + ' " id="RowdId_' + i + '" data-id="' + entry.id + '">');
                            entries.push('<span class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.desc + '</span>');
                            entries.push('</div>');
                        }

                    }
                });
                ganttLeftPanel.append(entries.join(""));
                return ganttLeftPanel;
            },

            // Create and return the data panel element
            dataPanel: function (element, width) {
                var dataPanel = $('<div class="dataPanel" style="width: ' + width + 'px;"/>');

                // Handle mousewheel events for scrolling the data panel
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                if (document.attachEvent) {
                    element.attachEvent("on" + mousewheelevt, function (e) { core.wheelScroll(element, e); });
                } else if (document.addEventListener) {
                    element.addEventListener(mousewheelevt, function (e) { core.wheelScroll(element, e); }, false);
                }

                // Handle click events and dispatch to registered `onAddClick`
                // function
                dataPanel.click(function (e) {

                    e.stopPropagation();
                    var corrX, corrY;
                    var leftpanel = $(element).find(".fn-gantt .leftPanel");
                    var datapanel = $(element).find(".fn-gantt .dataPanel");
                    switch (settings.scale) {
                        default:
                            corrY = tools.getCellSize() * 2;
                            break;
                    }

                    /* Adjust, so get middle of elm
                    corrY -= Math.floor(tools.getCellSize() / 2);
                    */

                    // Find column where click occurred
                    var col = core.elementFromPoint(e.pageX, datapanel.offset().top + corrY);
                    // Was the label clicked directly?
                    if (col.className === "fn-label") {
                        col = $(col.parentNode);
                    } else {
                        col = $(col);
                    }

                    var dt = col.attr("reptimestamp");
                    // Find row where click occurred
                    var row = core.elementFromPoint(leftpanel.offset().left + leftpanel.width() - 10, e.pageY);
                    // Was the lable clicked directly?
                    if (row.className.indexOf("fn-label") === 0) {
                        row = $(row.parentNode);
                    } else {
                        row = $(row);
                    }
                    var rowId = row.data().id;

                    // Dispatch user registered function with the TimestampTime in ms
                    // and the id if the clicked object is a row
                    settings.onAddClick(dt, rowId);
                });
                return dataPanel;
            },

            // Creates and return the right panel containing the year/week/day
            // header
            rightPanel: function (element, leftPanel) {

                var range = null;

                var headerArr = ['<div class="row"/>'];
                var daysInYear = 0;

                var subHeaderArr = ['<div class="row"/>'];
                var daysInMonth = 0;

                var dayArr = [];

                var hoursInDay = 0;

				range = tools.parseRange(element.timestampStart, element.timestampEnd, element.scaleStep);
				headerArr.push(
					('<div class="row header year" style="width: '+tools.getCellSize()*range+'px;"><div class="fn-label">Activity</div></div>'));
				for(var i=0; i < Math.floor(range/10); i ++) {
					//console.log(i);
					subHeaderArr.push(
						('<div class="row header year" style="width: '+tools.getCellSize()*10+'px;text-align:left;"><div class="fn-label">'+10*settings.scale * i+' '+settings.timeLabel +'</div></div>'));
				}
				// and the last element:
				subHeaderArr.push(
					('<div class="row header year" style="width: '+ (range - Math.floor(range/10)*10)*tools.getCellSize() +'px;text-align:left;"><div class="fn-label">'+10*settings.scale * Math.floor(range/10)+' ' + settings.timeLabel + '</div></div>'));

				var dataPanel = core.dataPanel(element, range * tools.getCellSize());


				// Append panel elements
				dataPanel.append(headerArr.join(""));
				dataPanel.append(subHeaderArr.join(""));

                return $('<div class="rightPanel"></div>').append(dataPanel);
            },

            // **Navigation**
            navigation: function (element) {
                var ganttNavigate = null;
                // Scrolling navigation is provided by setting
                // `settings.navigate='scroll'`
                if (settings.navigate === "scroll") {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<div class="nav-slider" />')
                            .append($('<div class="nav-slider-left" />')
                                .append($('<span role="button" class="nav-link nav-page-back"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        core.navigatePage(element, -1);
                                    }))
                                .append($('<div class="page-number"/>')
                                        .append($('<span/>')
                                            .html(element.pageNum + 1 + ' of ' + element.pageCount)))
                                .append($('<span role="button" class="nav-link nav-page-next"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        core.navigatePage(element, 1);
                                    })))
                            .append($('<div class="nav-slider-content" />')
                                    .append($('<div class="nav-slider-bar" />')
                                            .append($('<a class="nav-slider-button" />')
                                                )
                                                .mousedown(function (e) {
                                                    if (e.preventDefault) {
                                                        e.preventDefault();
                                                    }
                                                    element.scrollNavigation.scrollerMouseDown = true;
                                                    core.sliderScroll(element, e);
                                                })
// MG: replaced by mousemove event on document
//                                                .mousemove(function (e) {
//                                                    if (element.scrollNavigation.scrollerMouseDown) {
//                                                        core.sliderScroll(element, e);
//                                                    }
//                                                })
                                            )
                                        )
                            .append($('<div class="nav-slider-right" />')
                                .append($('<span role="button" class="nav-link nav-zoomIn"/>')
                                    .html('&#43;')
                                    .click(function () {
                                        core.zoomInOut(element, -1);
                                    }))
                                .append($('<span role="button" class="nav-link nav-zoomOut"/>')
                                    .html('&#45;')
                                    .click(function () {
                                        core.zoomInOut(element, 1);
                                    })).
								append($('<span id="nav-scale-level">Current scale (1 square) = '+ settings.scale +' &micro;s</span>')
									)
                                )
							);
                    $(document).mouseup(function () {
                        element.scrollNavigation.scrollerMouseDown = false;
                    });
                    // MG: added to continue scrolling when mouse moves out of scrollbar area.
                    $(document).mousemove(function (e) {
                        if (element.scrollNavigation.scrollerMouseDown) {
                            core.sliderScroll(element, e);
                        }
                    });
                    
                // Button navigation is provided by setting `settings.navigation='buttons'`
                } else {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<span role="button" class="nav-link nav-page-back"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigatePage(element, -1);
                            }))
                        .append($('<div class="page-number"/>')
                                .append($('<span/>')
                                    .html(element.pageNum + 1 + ' of ' + element.pageCount)))
                        .append($('<span role="button" class="nav-link nav-page-next"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigatePage(element, 1);
                            }))
                        .append($('<span role="button" class="nav-link nav-begin"/>')
                            .html('&#124;&lt;')
                            .click(function () {
                                core.navigateTo(element, 'begin');
                            }))
                        .append($('<span role="button" class="nav-link nav-prev-week"/>')
                            .html('&lt;&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * 7);
                            }))
                        .append($('<span role="button" class="nav-link nav-prev-day"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize());
                            }))
                        .append($('<span role="button" class="nav-link nav-now"/>')
                            .html('&#9679;')
                            .click(function () {
                                core.navigateTo(element, 'now');
                            }))
                        .append($('<span role="button" class="nav-link nav-next-day"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -1);
                            }))
                        .append($('<span role="button" class="nav-link nav-next-week"/>')
                            .html('&gt;&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -7);
                            }))
                        .append($('<span role="button" class="nav-link nav-end"/>')
                            .html('&gt;&#124;')
                            .click(function () {
                                core.navigateTo(element, 'end');
                            }))
                        .append($('<span role="button" class="nav-link nav-zoomIn"/>')
                            .html('&#43;')
                            .click(function () {
                                core.zoomInOut(element, -1);
                            }))
                        .append($('<span role="button" class="nav-link nav-zoomOut"/>')
                            .html('&#45;')
                            .click(function () {
                                core.zoomInOut(element, 1);
                            }));
                }
                return $('<div class="bottom"/>').append(ganttNavigate);
            },

            // **Progress Bar**
            // Return an element representing a progress of position within
            // the entire chart
            createProgressBar: function (us, cls, desc, label, dataObj) {
                var cellWidth = tools.getCellSize();
                var barMarg = tools.getProgressBarMargin() || 0;
                var bar = $('<div class="bar"><div class="fn-label">' + label + '</div></div>')
                        .addClass(cls)
                        .css({
                            width: ((us * cellWidth - barMarg + 5 < 0) ? 0 : (((cellWidth * us) - barMarg) + 5))
                        })
                        .data("dataObj", dataObj);

                if (desc) {
                    bar
                      .mouseover(function (e) {
                          var hint = $('<div class="fn-gantt-hint" />').html(desc);
                          $("body").append(hint);
                          hint.css("left", e.pageX);
                          hint.css("top", e.pageY);
                          hint.show();
                      })
                      .mouseout(function () {
                          $(".fn-gantt-hint").remove();
                      })
                      .mousemove(function (e) {
                          $(".fn-gantt-hint").css("left", e.pageX);
                          $(".fn-gantt-hint").css("top", e.pageY + 15);
                      });
                }
                bar.click(function (e) {
                    e.stopPropagation();
                    settings.onItemClick($(this).data("dataObj"));
                });
                return bar;
            },

            // Remove the `wd` (weekday) class and add `today` class to the
            // current day/week/month (depending on the current scale)
            markNow: function (element) {
                switch (settings.scale) {
                    /*case "weeks":
                        var cd = Timestamp.parse(new Timestamp());
                        cd = (Math.floor(cd / 36400000) * 36400000);
                        $(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                    case "months":
                        $(element).find(':findmonth("' + new Timestamp().getTime() + '")').removeClass('wd').addClass('today');
                        break;*/
                    default:
                        //var cd = Timestamp.parse(new Timestamp());
                        //cd = (Math.floor(cd / 36400000) * 36400000);
                        //$(element).find(':findday("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                }
            },

            // **Fill the Chart**
            // Parse the data and fill the data panel
            fillData: function (element, datapanel, leftpanel) {
                var invertColor = function (colStr) {
                    try {
                        colStr = colStr.replace("rgb(", "").replace(")", "");
                        var rgbArr = colStr.split(",");
                        var R = parseInt(rgbArr[0], 10);
                        var G = parseInt(rgbArr[1], 10);
                        var B = parseInt(rgbArr[2], 10);
                        var gray = Math.round((255 - (0.299 * R + 0.587 * G + 0.114 * B)) * 0.9, 1);
                        return "rgb(" + gray + ", " + gray + ", " + gray + ")";
                    } catch (err) {
                        return "";
                    }
                };
                // Loop through the values of each data element and set a row
                $.each(element.data, function (i, entry) {
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        $.each(entry.values, function (j, day) {
                            var _bar = null;

							var activityId = tools.genId();
							var dFrom = day.from;
							var dTo = day.to;

							var cFrom = dFrom * tools.getCellSize() / settings.scale;

// MG to prevent invisibly small bars, was:	var dl = ((dTo) - (dFrom)) / settings.scale;
							var dl = (((dTo) - (dFrom)) / settings.scale) + 0.1;
							_bar = core.createProgressBar(
										dl, // number of microseconds
										day.customClass ? day.customClass : "",
										day.desc ? day.desc : "",
										day.label ? day.label : "",
										day.dataObj ? day.dataObj : null
								);

							// find row
							var topEl = $(element).find("#rowheader" + i);

							var top = tools.getCellSize() * 2 + 2 + parseInt(topEl.attr("offset"), 10);
							_bar.css({ 'margin-top': top, 'margin-left': Math.floor(cFrom) });

							datapanel.append(_bar);
							
							var $l = _bar.find(".fn-label");
							if ($l && _bar.length) {
								var gray = invertColor(_bar[0].style.backgroundColor);
								$l.css("color", gray);
							} else if ($l) {
								$l.css("color", "");
							}
                        });

                    }
                });
            },
            // **Navigation**
            navigateTo: function (element, val) {
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                $dataPanel.click = function () {
                    alert(arguments.join(""));
                };
                var rightPanelWidth = $rightPanel.width();
                var dataPanelWidth = $dataPanel.width();

                switch (val) {
                    case "begin":
                        $dataPanel.animate({
                            "margin-left": "0px"
                        }, "fast", function () { core.repositionLabel(element); });
                        element.scrollNavigation.panelMargin = 0;
                        break;
                    case "end":
                        var mLeft = dataPanelWidth - rightPanelWidth;
                        element.scrollNavigation.panelMargin = mLeft * -1;
                        $dataPanel.animate({
                            "margin-left": "-" + mLeft + "px"
                        }, "fast", function () { core.repositionLabel(element); });
                        break;
                    case "now":
                        if (!element.scrollNavigation.canScroll || !$dataPanel.find(".today").length) {
                            return false;
                        }
                        var max_left = (dataPanelWidth - rightPanelWidth) * -1;
                        var cur_marg = $dataPanel.css("margin-left").replace("px", "");
                        var val = $dataPanel.find(".today").offset().left - $dataPanel.offset().left;
                        val *= -1;
                        if (val > 0) {
                            val = 0;
                        } else if (val < max_left) {
                            val = max_left;
                        }
                        $dataPanel.animate({
                            "margin-left": val + "px"
                        }, "fast", core.repositionLabel(element));
                        element.scrollNavigation.panelMargin = val;
                        break;
                    default:
                        var max_left = (dataPanelWidth - rightPanelWidth) * -1;
                        var cur_marg = $dataPanel.css("margin-left").replace("px", "");
                        var val = parseInt(cur_marg, 10) + val;
                        if (val <= 0 && val >= max_left) {
                            $dataPanel.animate({
                                "margin-left": val + "px"
                            }, "fast", core.repositionLabel(element));
                        }
                        element.scrollNavigation.panelMargin = val;
                        break;
                }
            },

            // Navigate to a specific page
            navigatePage: function (element, val) {
                if ((element.pageNum + val) >= 0 && (element.pageNum + val) < Math.ceil(element.rowsNum / settings.itemsPerPage)) {
                    core.waitToggle(element, true, function () {
                        element.pageNum += val;
                        element.hPosition = $(".fn-gantt .dataPanel").css("margin-left").replace("px", "");
                        element.scaleOldWidth = false;
                        core.init(element);
                    });
                }
            },

            // Change zoom level
            zoomInOut: function (element, val) {
                core.waitToggle(element, true, function () {
					var scale = settings.scale;
					if( val < 0) {
						// zoom in
						if(settings.scale/10 >= settings.minScale) {
							scale = settings.scale/10;
						}
					} else {
						// zoom out
						if(settings.scale*10 <= settings.maxScale){
							scale = settings.scale*10;
						}
					}

                    element.scaleStep = scale;
                    var headerRows = element.headerRows;

                    settings.scale = scale;
                    element.headerRows = headerRows;
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    element.hPosition = $dataPanel.css("margin-left").replace("px", "");
                    element.scaleOldWidth = ($dataPanel.width() - $rightPanel.width());
					
                    core.init(element);
                });
            },

            // Move chart via mouseclick
            mouseScroll: function (element, e) {
                var $dataPanel = $(element).find(".fn-gantt .dataPanel");
                $dataPanel.css("cursor", "move");
                var bPos = $dataPanel.offset();
                var mPos = element.scrollNavigation.mouseX === null ? e.pageX : element.scrollNavigation.mouseX;
                var delta = e.pageX - mPos;
                element.scrollNavigation.mouseX = e.pageX;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via mousewheel
            wheelScroll: function (element, e) {
                var delta = e.detail ? e.detail * (-50) : e.wheelDelta / 120 * 50;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);

                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    return false;
                }
            },

            // Move chart via slider control
            sliderScroll: function (element, e) {
                var $sliderBar = $(element).find(".nav-slider-bar");
                var $sliderBarBtn = $sliderBar.find(".nav-slider-button");
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                var bPos = $sliderBar.offset();
                var bWidth = $sliderBar.width();
                var wButton = $sliderBarBtn.width();

                var pos, mLeft;

                if ((e.pageX >= bPos.left) && (e.pageX <= bPos.left + bWidth)) {
                    pos = e.pageX - bPos.left;
                    pos = pos - wButton / 2;
                    $sliderBarBtn.css("left", pos);

                    mLeft = $dataPanel.width() - $rightPanel.width();

                    var pPos = pos * mLeft / bWidth * -1;
                    if (pPos >= 0) {
                        $dataPanel.css("margin-left", "0px");
                        element.scrollNavigation.panelMargin = 0;
                    } else if (pos >= bWidth - (wButton * 1)) {
                        $dataPanel.css("margin-left", mLeft * -1 + "px");
                        element.scrollNavigation.panelMargin = mLeft * -1;
                    } else {
                        $dataPanel.css("margin-left", pPos + "px");
                        element.scrollNavigation.panelMargin = pPos;
                    }
                    clearTimeout(element.scrollNavigation.repositionDelay);
                    element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 5, element);
                }
            },

            // Uptimestamp scroll panel margins
            scrollPanel: function (element, delta) {
                if (!element.scrollNavigation.canScroll) {
                    return false;
                }
                var _panelMargin = parseInt(element.scrollNavigation.panelMargin, 10) + delta;
                if (_panelMargin > 0) {
                    element.scrollNavigation.panelMargin = 0;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                } else if (_panelMargin < element.scrollNavigation.panelMaxPos * -1) {
                    element.scrollNavigation.panelMargin = element.scrollNavigation.panelMaxPos * -1;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                } else {
                    element.scrollNavigation.panelMargin = _panelMargin;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin + "px");
                }
                core.synchronizeScroller(element);
            },

            // Synchronize scroller
            synchronizeScroller: function (element) {
                if (settings.navigate === "scroll") {
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    var $sliderBar = $(element).find(".nav-slider-bar");
                    var $sliderBtn = $sliderBar.find(".nav-slider-button");

                    var bWidth = $sliderBar.width();
                    var wButton = $sliderBtn.width();

                    var mLeft = $dataPanel.width() - $rightPanel.width();
                    var hPos = 0;
                    if ($dataPanel.css("margin-left")) {
                        hPos = $dataPanel.css("margin-left").replace("px", "");
                    }
                    var pos = hPos * bWidth / mLeft - $sliderBtn.width() * 0.25;
                    pos = pos > 0 ? 0 : (pos * -1 >= bWidth - (wButton * 0.75)) ? (bWidth - (wButton * 1.25)) * -1 : pos;
                    $sliderBtn.css("left", pos * -1);
                }
            },

            // Reposition data labels
            repositionLabel: function (element) {
                setTimeout(function () {
                    var $dataPanel;
                    if (!element) {
                        $dataPanel = $(".fn-gantt .rightPanel .dataPanel");
                    } else {
                        var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                        $dataPanel = $rightPanel.find(".dataPanel");
                    }

                    if (settings.useCookie) {
                        $.cookie(this.cookieKey + "ScrollPos", $dataPanel.css("margin-left").replace("px", ""));
                    }
                }, 500);
            },

            // waitToggle
            waitToggle: function (element, show, fn) {
                if (show) {
                    var eo = $(element).offset();
                    var ew = $(element).outerWidth();
                    var eh = $(element).outerHeight();

                    if (!element.loader) {
                        element.loader = $('<div class="fn-gantt-loader" style="position: absolute; top: ' + eo.top + 'px; left: ' + eo.left + 'px; width: ' + ew + 'px; height: ' + eh + 'px;">'
                        + '<div class="fn-gantt-loader-spinner"><span>' + settings.waitText + '</span></div></div>');
                    }
                    $("body").append(element.loader);
                    setTimeout(fn, 100);

                } else {
                    if (element.loader) {
                        element.loader.remove();
                    }
                    element.loader = null;
                }
            }
        };

        // Utility functions
        // =================
		var uId = 0;
        var tools = {

            // Return the maximum available timestamp in data depending on the scale
            getMaxTimestamp: function (element) {
                var maxTimestamp = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, timestamp) {
                        maxTimestamp = maxTimestamp < timestamp.to ? timestamp.to : maxTimestamp;
                    });
                });
                
				return maxTimestamp / settings.scale;
            },

            // Return the minimum available timestamp in data depending on the scale
            getMinTimestamp: function (element) {
                var minTimestamp = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, timestamp) {
                        minTimestamp = minTimestamp > timestamp.from || minTimestamp === null ? timestamp.from : minTimestamp;
                    });
                });
				return minTimestamp / settings.scale;
            },

            // Return an array of Timestamp objects between `from` and `to`
            parseTimestampRange: function (from, to) {
                var current = new Timestamp(from.getTime());
                var end = new Timestamp(to.getTime());
                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Timestamp(current.getTime());
                    current.setTimestamp(current.getTimestamp() + 1);
                } while (current.getTime() <= to.getTime());
                return ret;

            },

            // Return an array of Timestamp objects between `from` and `to`,
            // scaled hourly
            parseRange: function (from, to, scaleStep) {
                return to - from;
            },

            // Return an array of Timestamp objects between a range of weeks
            // between `from` and `to`
            parseWeeksRange: function (from, to) {

                var current = new Timestamp(from);
                var end = new Timestamp(to);

                var ret = [];
                var i = 0;
                do {
                    if (current.getDay() === 0) {
                        ret[i++] = current.getDayForWeek();
                    }
                    current.setTimestamp(current.getTimestamp() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },


            // Return an array of Timestamp objects between a range of months
            // between `from` and `to`
            parseMonthsRange: function (from, to) {

                var current = new Timestamp(from);
                var end = new Timestamp(to);

                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Timestamp(current.getFullYear(), current.getMonth(), 1);
                    current.setMonth(current.getMonth() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },

            // Deserialize a timestamp from a string
            timestampDeserialize: function (timestampStr) {
                //return eval("new" + timestampStr.replace(/\//g, " "));
                //var timestamp = eval("new" + timestampStr.replace(/\//g, " "));
                //return new Timestamp(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCTimestamp(), timestamp.getUTCHours(), timestamp.getUTCMinutes());
				return timestampStr;
            },
            // Generate an id for a timestamp
            genId: function (ticks) {
                return uId++;
            },

            // Get the current cell size
            _getCellSize: null,
            getCellSize: function () {
                if (!tools._getCellSize) {
                    $("body").append(
                        $('<div style="display: none; position: absolute;" class="fn-gantt" id="measureCellWidth"><div class="row"></div></div>')
                    );
                    tools._getCellSize = $("#measureCellWidth .row").height();
                    $("#measureCellWidth").empty().remove();
                }
                return tools._getCellSize;
            },

            // Get the current size of the rigth panel
            getRightPanelSize: function () {
                $("body").append(
                    $('<div style="display: none; position: absolute;" class="fn-gantt" id="measureCellWidth"><div class="rightPanel"></div></div>')
                );
                var ret = $("#measureCellWidth .rightPanel").height();
                $("#measureCellWidth").empty().remove();
                return ret;
            },

            // Get the current page height
            getPageHeight: function (element) {
                return element.pageNum + 1 === element.pageCount ? element.rowsOnLastPage * tools.getCellSize() : settings.itemsPerPage * tools.getCellSize();
            },

            // Get the current margin size of the progress bar
            _getProgressBarMargin: null,
            getProgressBarMargin: function () {
                if (!tools._getProgressBarMargin) {
                    $("body").append(
                        $('<div style="display: none; position: absolute;" id="measureBarWidth" ><div class="fn-gantt"><div class="rightPanel"><div class="dataPanel"><div class="row day"><div class="bar" /></div></div></div></div></div>')
                    );
                    tools._getProgressBarMargin = parseInt($("#measureBarWidth .fn-gantt .rightPanel .day .bar").css("margin-left").replace("px", ""), 10);
                    tools._getProgressBarMargin += parseInt($("#measureBarWidth .fn-gantt .rightPanel .day .bar").css("margin-right").replace("px", ""), 10);
                    $("#measureBarWidth").empty().remove();
                }
                return tools._getProgressBarMargin;
            }
        };


        this.each(function () {
            /**
            * Extend options with default values
            */
            if (options) {
                $.extend(settings, options);
            }

            this.data = null;        // Received data
            this.pageNum = 0;        // Current page number
            this.pageCount = 0;      // Available pages count
            this.rowsOnLastPage = 0; // How many rows on last page
            this.rowsNum = 0;        // Number of total rows
            this.hPosition = 0;      // Current position on diagram (Horizontal)
            this.timestampStart = null;
            this.timestampEnd = null;
            this.scrollClicked = false;
            this.scaleOldWidth = null;
            this.headerRows = null;

            // Uptimestamp cookie with current scale
            if (settings.useCookie) {
                var sc = $.cookie(this.cookieKey + "CurrentScale");
                if (sc) {
                    settings.scale = $.cookie(this.cookieKey + "CurrentScale");
                } else {
                    $.cookie(this.cookieKey + "CurrentScale", settings.scale);
                }
            }

            switch (settings.scale) {
                /*case "hours": this.headerRows = 5; this.scaleStep = 1; break;
                case "weeks": this.headerRows = 3; this.scaleStep = 13; break;
                case "months": this.headerRows = 2; this.scaleStep = 14; break;*/
                default: this.headerRows = 2; this.scaleStep = 1; break;
            }

            this.scrollNavigation = {
                panelMouseDown: false,
                scrollerMouseDown: false,
                mouseX: null,
                panelMargin: 0,
                repositionDelay: 0,
                panelMaxPos: 0,
                canScroll: true
            };

            this.gantt = null;
            this.loader = null;

            core.create(this);

        });

    };
})(jQuery);
