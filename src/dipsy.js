var dipsy;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
dipsy = {};
$(document).ready(function() {
  dipsy.Theme = (function() {
    __extends(Theme, Backbone.Model);
    function Theme() {
      Theme.__super__.constructor.apply(this, arguments);
    }
    Theme.prototype.defaults = {
      bg_fill: "#fff",
      bg_fill_opacity: .6,
      stroke: "#fff",
      stroke_opacity: .8,
      stroke_width: 1
    };
    return Theme;
  })();
  dipsy.Pop = (function() {
    __extends(Pop, Backbone.Model);
    function Pop() {
      this.getRoot = __bind(this.getRoot, this);
      this.getPelement = __bind(this.getPelement, this);
      this.getElement = __bind(this.getElement, this);
      this.setContent = __bind(this.setContent, this);
      this.setOffset = __bind(this.setOffset, this);
      this.setAnchor = __bind(this.setAnchor, this);
      Pop.__super__.constructor.apply(this, arguments);
    }
    Pop.prototype.defaults = {
      className: "",
      view: void 0,
      root: void 0,
      pelement: void 0,
      anchor: {
        x: 0,
        y: 0
      },
      offset: {
        x: 0,
        y: 0
      },
      center: {
        x: 0,
        y: 0
      },
      hitch: (Pop.prototype.x = 0, Pop.prototype.y = 0),
      size: {
        w: 100,
        h: 100
      },
      theme: new dipsy.Theme(),
      handle_mouse: true,
      follow_mouse: false,
      stuck: false,
      drag_move: false,
      force_move: false,
      neighbors: void 0,
      colliders: void 0,
      nve: void 0,
      element: void 0,
      bbox: void 0,
      pbbox: void 0
    };
    Pop.prototype.initialize = function() {
      var pelement;
      console.log("init!!!");
      pelement = this.getPelement().node();
      this.set({
        nve: pelement.nearestViewportElement
      });
      this.setContent(this.get("content"));
      this.setAnchor(this.get("anchor"));
      return this.setOffset(this.get("offset"));
    };
    Pop.prototype.setAnchor = function(point, transform) {
      var matrix, mp, nve, p, pelement;
      if (transform == null) {
        transform = true;
      }
      if (transform) {
        pelement = this.getPelement().node();
        nve = this.get("nve");
        matrix = pelement.getTransformToElement(nve);
        mp = nve.createSVGPoint();
        mp.x = point.x;
        mp.y = point.y;
        p = mp.matrixTransform(matrix);
        return this.set({
          anchor: p
        });
      } else {
        return this.set({
          anchor: point
        });
      }
    };
    Pop.prototype.setOffset = function(offset) {
      var size;
      console.log(offset);
      if (typeof offset === "string") {
        size = this.get("size");
        switch (offset) {
          case "center":
            return this.set({
              offset: {
                x: 0,
                y: 0
              }
            });
          case "N":
            return this.set({
              offset: {
                x: 0,
                y: size.h / 2 + 10
              }
            });
          case "S":
            return this.set({
              offset: {
                x: 0,
                y: -size.h / 2 - 10
              }
            });
          case "E":
            return this.set({
              offset: {
                x: size.w + 10,
                y: 0
              }
            });
          case "W":
            return this.set({
              offset: {
                x: -size.w - 10,
                y: 0
              }
            });
          default:
            return this.set({
              offset: {
                x: 0,
                y: 0
              }
            });
        }
      } else if (typeof offset === "undefined") {
        return this.set({
          offset: {
            x: 0,
            y: 0
          }
        });
      } else {
        return this.set({
          offset: offset
        });
      }
    };
    Pop.prototype.setContent = function(content) {
      if (typeof content === "function") {
        return this.set({
          content: content
        });
      } else {
        return this.set({
          content: function(ele) {
            return ele.append("svg:text").text(content).attr("x", 5).attr("y", function() {
              var bbox;
              bbox = this.getBBox();
              return bbox.height + 5;
            });
          }
        });
      }
    };
    Pop.prototype.getElement = function() {
      return d3.select("." + this.get("element"));
    };
    Pop.prototype.getPelement = function() {
      return d3.select("." + this.get("pelement"));
    };
    Pop.prototype.getRoot = function() {
      return d3.select("." + this.get("root"));
    };
    return Pop;
  })();
  dipsy.Pops = (function() {
    __extends(Pops, Backbone.Collection);
    function Pops() {
      this.render = __bind(this.render, this);
      this.addView = __bind(this.addView, this);
      Pops.__super__.constructor.apply(this, arguments);
    }
    Pops.prototype.model = dipsy.Pop;
    Pops.prototype.url = "/";
    Pops.prototype.initialize = function() {
      return this.bind("add", this.addView);
    };
    Pops.prototype.addView = function(pop) {
      return pop.set({
        view: new dipsy.PopView({
          model: pop
        })
      });
    };
    Pops.prototype.render = function() {
      console.log("render all!");
      return this.each(function(pop) {
        return pop.get("view").render();
      });
    };
    return Pops;
  })();
  return dipsy.PopView = (function() {
    __extends(PopView, Backbone.View);
    function PopView() {
      this.render = __bind(this.render, this);
      this.updatePos = __bind(this.updatePos, this);
      this.updateSize = __bind(this.updateSize, this);
      this.updateTheme = __bind(this.updateTheme, this);
      PopView.__super__.constructor.apply(this, arguments);
    }
    PopView.prototype.initialize = function() {
      this.model.bind("change:anchor", this.updatePos);
      this.model.bind("change:offset", this.updatePos);
      this.model.bind("change:center", this.updatePos);
      return this.model.bind("change:size", this.updateSize);
    };
    PopView.prototype.updateTheme = function() {
      var bgrect, element, theme;
      element = this.model.getElement();
      theme = this.model.get("theme").toJSON();
      return bgrect = element.select(".dipsy_bgrect").attr("stroke", theme.stroke).attr("stroke-opacity", theme.stroke_opacity).attr("stroke-width", theme.stroke_width).attr("fill", theme.bg_fill).attr("fill-opacity", theme.bg_fill_opacity);
    };
    PopView.prototype.updateSize = function() {
      var bgrect, element, size;
      element = this.model.getElement();
      size = this.model.get("size");
      return bgrect = element.select(".dipsy_bgrect").attr("width", size.w).attr("height", size.h);
    };
    PopView.prototype.updatePos = function() {
      var anchor, center, element, offset, size, x, y;
      element = this.model.getElement();
      anchor = this.model.get("anchor");
      offset = this.model.get("offset");
      center = this.model.get("center");
      size = this.model.get("size");
      x = anchor.x + offset.x + center.x - size.w / 2;
      y = anchor.y + offset.y + center.y - size.h / 2;
      return element.attr("transform", "translate(" + [x, y] + ")");
    };
    PopView.prototype.render = function() {
      var bgrect, content, element, elid, root;
      if (_.isUndefined(this.model.get("element"))) {
        root = this.model.getRoot();
        elid = "dipsy_pop_" + this.model.get("className") + "_" + this.model.cid;
        element = root.append("svg:g").attr("class", elid);
        bgrect = element.append("svg:rect").attr("class", "dipsy_bgrect");
        this.model.set({
          element: elid
        });
      } else {
        element = this.model.getElement();
        element.select(".dipsy_content").remove();
      }
      content = element.append("svg:g").attr("class", ".dipsy_content");
      this.model.get("content")(content);
      this.updatePos();
      this.updateSize();
      return this.updateTheme();
    };
    return PopView;
  })();
});