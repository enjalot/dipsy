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
      this.toggleRotated = __bind(this.toggleRotated, this);
      this.togglePosted = __bind(this.togglePosted, this);
      this.setPosted = __bind(this.setPosted, this);
      this.show = __bind(this.show, this);
      this.hide = __bind(this.hide, this);
      this.getSize = __bind(this.getSize, this);
      this.getPos = __bind(this.getPos, this);
      this.getRoot = __bind(this.getRoot, this);
      this.getPelement = __bind(this.getPelement, this);
      this.getElement = __bind(this.getElement, this);
      this.setContent = __bind(this.setContent, this);
      this.setOffset = __bind(this.setOffset, this);
      this.setCenter = __bind(this.setCenter, this);
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
      offset_code: "",
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
      posted: false,
      rotated: false,
      auto_size: false,
      drag_move: false,
      force_move: false,
      fixed: true,
      neighbors: void 0,
      colliders: void 0,
      nve: void 0,
      element: void 0,
      bbox: void 0,
      pbbox: void 0,
      visible: false
    };
    Pop.prototype.initialize = function() {
      var pelement;
      pelement = this.getPelement().node();
      this.set({
        nve: pelement.nearestViewportElement
      });
      this.setContent(this.get("content"));
      this.setAnchor(this.get("anchor"));
      this.setOffset(this.get("offset"));
      this.bind("dipsy:hide", this.hide);
      return this.bind("dipsy:show", this.show);
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
    Pop.prototype.setCenter = function(point, transform, silent) {
      var anchor, matrix, mp, nve, offset, p, pelement, x, y;
      if (transform == null) {
        transform = true;
      }
      if (silent == null) {
        silent = false;
      }
      anchor = this.get("anchor");
      offset = this.get("offset");
      if (transform) {
        pelement = this.getPelement().node();
        nve = this.get("nve");
        matrix = pelement.getTransformToElement(nve);
        mp = nve.createSVGPoint();
        mp.x = point.x;
        mp.y = point.y;
        p = mp.matrixTransform(matrix);
      } else {
        p = point;
      }
      x = p.x - offset.x - anchor.x;
      y = p.y - offset.y - anchor.y;
      return this.set({
        center: {
          x: x,
          y: y
        }
      }, {
        silent: silent
      });
    };
    Pop.prototype.setOffset = function(offset) {
      var size;
      if (typeof offset === "undefined") {
        offset = this.get("offset_code");
      } else {
        this.set({
          "offset_code": offset
        });
      }
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
      } else {
        return this.set({
          offset: {
            x: 0,
            y: 0
          }
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
      return d3.select("#" + this.get("element"));
    };
    Pop.prototype.getPelement = function() {
      return d3.select("#" + this.get("pelement"));
    };
    Pop.prototype.getRoot = function() {
      return d3.select("#" + this.get("root"));
    };
    Pop.prototype.getPos = function() {
      var anchor, center, offset, x, y;
      anchor = this.get("anchor");
      offset = this.get("offset");
      center = this.get("center");
      x = anchor.x + offset.x + center.x;
      y = anchor.y + offset.y + center.y;
      return {
        x: x,
        y: y
      };
    };
    Pop.prototype.getSize = function() {
      return this.get("size");
    };
    Pop.prototype.hide = function() {
      return this.set({
        visible: false
      });
    };
    Pop.prototype.show = function() {
      return this.set({
        visible: true
      });
    };
    Pop.prototype.setPosted = function(posted) {
      return this.set({
        posted: posted
      });
    };
    Pop.prototype.togglePosted = function() {
      return this.set({
        posted: !this.get("posted")
      });
    };
    Pop.prototype.toggleRotated = function() {
      var size;
      this.set({
        rotated: !this.get("rotated")
      });
      size = this.getSize();
      this.set({
        size: {
          w: size.h,
          h: size.w
        }
      });
      return this.setOffset();
    };
    return Pop;
  })();
  dipsy.Pops = (function() {
    __extends(Pops, Backbone.Collection);
    function Pops() {
      this.calcColliders = __bind(this.calcColliders, this);
      this.getColliders = __bind(this.getColliders, this);
      this.getNeighbors = __bind(this.getNeighbors, this);
      this.buildQuadTree = __bind(this.buildQuadTree, this);
      this.getNode = __bind(this.getNode, this);
      this.updatePos = __bind(this.updatePos, this);
      this.stopForce = __bind(this.stopForce, this);
      this.startForce = __bind(this.startForce, this);
      this.initForce = __bind(this.initForce, this);
      this.rotate = __bind(this.rotate, this);
      this.render = __bind(this.render, this);
      this.select = __bind(this.select, this);
      this.addNode = __bind(this.addNode, this);
      this.addView = __bind(this.addView, this);
      Pops.__super__.constructor.apply(this, arguments);
    }
    Pops.prototype.model = dipsy.Pop;
    Pops.prototype.url = "/";
    Pops.prototype.force_status = false;
    Pops.prototype.initialize = function() {
      this.bind("add", this.addView);
      this.bind("add", this.addNode);
      this.force = d3.layout.force().gravity(0).charge(-50).annealing(.96);
      return this.nodes = this.force.nodes();
    };
    Pops.prototype.addView = function(pop) {
      return pop.set({
        view: new dipsy.PopView({
          model: pop
        })
      });
    };
    Pops.prototype.addNode = function(pop) {
      var node;
      node = pop.getPos();
      node.cid = pop.cid;
      return this.nodes.push(node);
    };
    Pops.prototype.select = function(id) {
      return this.find(__bind(function(pop) {
        return pop.get("pelement") === id;
      }, this));
    };
    Pops.prototype.render = function() {
      console.log("render all!");
      return this.each(function(pop) {
        var view;
        view = pop.get("view");
        return view.render();
      });
    };
    Pops.prototype.rotate = function() {
      return this.each(__bind(function(pop) {
        return pop.toggleRotated();
      }, this));
    };
    Pops.prototype.initForce = function(w, h) {
      this.force.size([w, h]);
      return this.force.on("tick", __bind(function(e) {
        var k;
        this.force_status = true;
        if (e.stopping) {
          this.force_status = false;
          this.trigger("force:stopped");
          return true;
        }
        k = e.alpha * .1;
        return this.nodes.forEach(__bind(function(node, i) {
          var anchor, pop;
          pop = this.getByCid(node.cid);
          anchor = pop.get("anchor");
          node.x += (anchor.x - node.x) * k;
          node.y += (anchor.y - node.y) * k;
          return pop.setCenter(node, false, false);
        }, this));
      }, this));
    };
    Pops.prototype.startForce = function() {
      return this.force.start();
    };
    Pops.prototype.stopForce = function() {
      return this.force.stop();
    };
    Pops.prototype.updatePos = function(pop) {
      var node, pos;
      node = this.getNode(pop);
      pos = pop.getPos();
      node.x = pos.x;
      return node.y = pos.y;
    };
    Pops.prototype.getNode = function(pop) {
      var node;
      return node = _.find(this.nodes, __bind(function(n) {
        return n.cid === pop.cid;
      }, this));
    };
    Pops.prototype.buildQuadTree = function() {
      console.log("build qt");
      return this.qt = d3.geom.quadtree(this.nodes);
    };
    Pops.prototype.getNeighbors = function(pop) {
      var n, nn, size, x0, x3, y0, y3;
      size = pop.getSize();
      n = this.getNode(pop);
      nn = [];
      x0 = n.x - size.w;
      y0 = n.y - size.h;
      x3 = n.x + size.w;
      y3 = n.y + size.h;
      this.qt.visit(__bind(function(node, x1, y1, x2, y2) {
        var p;
        p = node.point;
        if (p && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3) && p !== n) {
          console.log("PUSH");
          console.log(p);
          console.log(pop);
          nn.push(p);
        }
        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
      }, this));
      return nn;
    };
    Pops.prototype.getColliders = function(pop) {
      var colliders, nn;
      colliders = [];
      nn = this.getNeighbors(pop);
      nn.forEach(__bind(function(n) {
        if (false) {
          return colliders.push(n);
        }
      }, this));
      return colliders;
    };
    Pops.prototype.calcColliders = function() {
      var count, counts;
      if (!this.qt) {
        this.buildQuadTree();
      }
      counts = [];
      count = 0;
      console.log(this.nodes);
      this.each(__bind(function(pop) {
        var nn;
        nn = this.getNeighbors(pop);
        counts.push(nn);
        if (nn.length > 0) {
          return count++;
        }
      }, this));
      return count;
    };
    return Pops;
  })();
  return dipsy.PopView = (function() {
    __extends(PopView, Backbone.View);
    function PopView() {
      this.setMouseHandlers = __bind(this.setMouseHandlers, this);
      this.render = __bind(this.render, this);
      this.updatePos = __bind(this.updatePos, this);
      this.autoSize = __bind(this.autoSize, this);
      this.updateSize = __bind(this.updateSize, this);
      this.updateVisible = __bind(this.updateVisible, this);
      this.updateTheme = __bind(this.updateTheme, this);
      PopView.__super__.constructor.apply(this, arguments);
    }
    PopView.prototype.initialize = function() {
      this.model.bind("change:anchor", this.updatePos);
      this.model.bind("change:offset", this.updatePos);
      this.model.bind("change:center", this.updatePos);
      this.model.bind("change:rotated", this.updatePos);
      this.model.bind("change:size", this.updateSize);
      this.model.bind("change:visible", this.updateVisible);
      this.bind("dipsy:rendered", this.setMouseHandlers);
      this.bind("dipsy:rendered", this.updatePos);
      this.bind("dipsy:rendered", this.updateSize);
      this.bind("dipsy:rendered", this.updateTheme);
      this.bind("dipsy:rendered", this.updateVisible);
      if (this.model.get("auto_size")) {
        return this.bind("dipsy:rendered", this.autoSize);
      }
    };
    PopView.prototype.updateTheme = function() {
      var bgrect, element, theme;
      element = this.model.getElement();
      theme = this.model.get("theme").toJSON();
      return bgrect = element.select(".dipsy_bgrect").attr("stroke", theme.stroke).attr("stroke-opacity", theme.stroke_opacity).attr("stroke-width", theme.stroke_width).attr("fill", theme.bg_fill).attr("fill-opacity", theme.bg_fill_opacity);
    };
    PopView.prototype.updateVisible = function() {
      var element, visible;
      visible = this.model.get("visible") ? "visible" : "hidden";
      return element = this.model.getElement().attr("visibility", visible);
    };
    PopView.prototype.updateSize = function() {
      var bgrect, element, size;
      element = this.model.getElement();
      size = this.model.get("size");
      return bgrect = element.select(".dipsy_bgrect").attr("width", size.w).attr("height", size.h);
    };
    PopView.prototype.autoSize = function() {
      var bbox, element;
      element = this.model.getElement();
      bbox = element.node().getBBox();
      return this.model.set({
        size: {
          w: bbox.width,
          h: bbox.height
        }
      });
    };
    PopView.prototype.updatePos = function() {
      var content, element, offset, pos, size;
      element = this.model.getElement();
      pos = this.model.getPos();
      size = this.model.get("size");
      element.attr("transform", "translate(" + [pos.x - size.w / 2, pos.y - size.h / 2] + ")");
      if (this.model.get("rotated")) {
        offset = this.model.get("offset");
        content = element.select("g.dipsy_content");
        return content.attr("transform", "rotate(90 " + [0, 0] + ")translate(" + [0, -offset.y] + ")");
      }
    };
    PopView.prototype.render = function() {
      var bgrect, content, element, elid, root;
      if (_.isUndefined(this.model.get("element"))) {
        root = this.model.getRoot();
        elid = "dipsy_pop_" + this.model.get("className") + "_" + this.model.cid;
        element = root.append("svg:g").attr("id", elid);
        bgrect = element.append("svg:rect").attr("class", "dipsy_bgrect");
        this.model.set({
          element: elid
        });
      } else {
        element = this.model.getElement();
        element.select(".dipsy_content").remove();
      }
      content = element.append("svg:g").attr("class", "dipsy_content");
      this.model.get("content")(content);
      return this.trigger("dipsy:rendered");
    };
    PopView.prototype.setMouseHandlers = function() {
      var dclass, element, papa, parent_click, parent_move, parent_out, parent_over, this_out, this_over;
      parent_out = __bind(function() {
        var e, ee, eles, _i, _len;
        ee = d3.event.toElement;
        eles = this.model.getElement().node().childNodes;
        for (_i = 0, _len = eles.length; _i < _len; _i++) {
          e = eles[_i];
          if (ee === e) {
            console.log("CANCEL");
            d3.event.stopImmediatePropagation();
            false;
          }
        }
        if (!this.model.get("posted")) {
          return this.model.trigger("dipsy:hide");
        }
      }, this);
      this_out = __bind(function() {
        var e, ee, eles, pelement, _i, _len;
        ee = d3.event.toElement;
        pelement = this.model.getPelement().node();
        eles = this.model.getElement().node().childNodes;
        for (_i = 0, _len = eles.length; _i < _len; _i++) {
          e = eles[_i];
          if (ee === e) {
            return false;
          }
        }
        if (ee === pelement) {
          false;
        } else {
          if (pelement.__onmouseout) {
            pelement.__onmouseout(d3.event);
          }
        }
        if (!this.model.get("posted")) {
          return this.model.trigger("dipsy:hide");
        }
      }, this);
      this_over = __bind(function() {
        return false;
      }, this);
      parent_over = __bind(function() {
        return this.model.trigger("dipsy:show");
      }, this);
      parent_move = __bind(function() {
        var m, pelement;
        if (!this.model.get("posted")) {
          pelement = this.model.getPelement().node();
          m = d3.svg.mouse(pelement);
          return this.model.setAnchor({
            "x": m[0],
            "y": m[1]
          });
        }
      }, this);
      parent_click = __bind(function() {
        return this.model.togglePosted();
      }, this);
      if (this.model.get("handle_mouse")) {
        dclass = this.model.get("className");
        papa = this.model.getPelement().on("mouseover.dipsy_" + dclass, parent_over).on("mouseout.dipsy_" + dclass, parent_out).on("click.dipsy_" + dclass, parent_click);
        element = this.model.getElement();
        element.on("mouseout.dipsy_" + dclass, this_out);
        element.on("mouseover.dipsy_" + dclass, this_over);
        if (this.model.get("follow_mouse")) {
          element.on("mousemove.dipsy_" + dclass, parent_move);
          return papa.on("mousemove.dipsy_" + dclass, parent_move);
        } else {
          element.on("mousemove.dipsy_" + dclass, null);
          return papa.on("mousemove.dipsy_" + dclass, null);
        }
      } else {
        dclass = this.model.get("className");
        papa = this.model.getPelement().on("mouseover.dipsy_" + dclass, null).on("mouseout.dipsy_" + dclass, null).on("click.dipsy_" + dclass, null);
        element = this.model.getElement();
        element.on("mouseout.dipsy_" + dclass, null);
        element.on("mouseover.dipsy_" + dclass, null);
        return false;
      }
    };
    return PopView;
  })();
});