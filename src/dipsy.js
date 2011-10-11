//dipsy, pure svg popups and tooltips for d3
//version 0.0.1
//author: Ian 'enjalot' Johnson, http://visual.ly
//released under zlib license

dipsy = {version : "0.0.1"};

function maybeCall(thing, ctx)
{
    //from jquery tipsy plugin http://onehackoranother.com/projects/jquery/tipsy/
    return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
}

dipsy.Pops = function(root)
{
    //root svg element to append our popups to
    //this will typically be the the <svg> element itself
    //or a group with proper transformations
    this.root = root;

    //keep track of our popups
    this.pops = [];
    //TODO: deal with multiple tooltips for one parent element

}


dipsy.Pops.prototype = 
{
    //TODO make backbone classes with nice options
    add: function(element, content, anchor, follow_mouse)
    {
        var newpop = new dipsy.Pop(  this.root,
                        this.pops.length, 
                        element,
                        content
                        );

        //console.log(newpop);
        this.pops.push( newpop );
        return newpop;
    },

    get: function(pelement)
    {
        var ret = [];
        this.pops.forEach(function(p)
        {
            if (p.pelement == pelement)
            {
                ret.push(p);
            }
        });
        return ret;
    }
}

dipsy.Pop = function(root, id, pelement, content)
{
    //default values
    this.root = root;
    this.id = id;
    this.pelement = pelement;
    var pbbox = pelement.getBBox();
    this.parent_bbox = pbbox;
    this.content = content;
    this.anchor = null;
    this.offset = null;
    //not sure if its a good idea to store this for every one (vs accessing)
    this.nve = pelement.nearestViewportElement;

    this.follow_mouse = false;
    this.stuck = false;

    var anchor = { "x": pbbox.x + pbbox.width/2,
                   "y": pbbox.y + pbbox.height/2}

    this.init();
    
    this.setAnchor(anchor);
    this.setMouseHandlers();
    
    this.hide();
}

dipsy.Pop.prototype = {
    init: function()
    {
        //initialize the tooltip
        //generate the svg for the background and 
        this.element = this.root.append("svg:g")
            .attr("class", "dipsy_pop")

        var bgrect = this.element.append("svg:rect");

        if(typeof(this.content) == "function")
        {
            //console.log(this.element);
            //console.log(content);
            this.content(this.element);
        }
        // if(typeof(content) == "string")
        else
        {
            this.element.append("svg:text")
                .text(this.content)
                .attr("x", 5)
                .attr("y", function(d) 
                {
                    var bbox = this.getBBox();
                    return bbox.height/2 + 5;
                });
        }

        var cbbox = this.element.node().getBBox();
        var w = cbbox.width + 10;
        var h = cbbox.height + 5;

        bgrect
            .attr("width", w)
            .attr("height", h)
            .attr("stroke", "#aaa")
            .attr("fill", "#fff")
            .attr("fill-opacity", .5);

        this.offset = { "x":  -w/2,
                        "y":  -h - 10};

    },

    show: function()
    {
        this.element.attr("visibility", "visible");
    },

    hide: function()
    {
        if(!this.stuck)
        {
            this.element.attr("visibility", "hidden");
        }
    },

    remove: function()
    {
        //console.log("remove");
    },

    setAnchor: function(point, transform)
    {
        transform = transform || true;
        if(transform)
        {
            var matrix = this.pelement.getTransformToElement(this.nve);
            var mp = this.nve.createSVGPoint();
            mp.x = point.x;
            mp.y = point.y;
            var p = mp.matrixTransform(matrix);
            this.anchor = p;
        }
        else
        {
            this.anchor = point;
        }
        this.move();
        //console.log(this.anchor);
    },

    move: function()
    {
        //TODO: name this function move? just want to update translation if anchor has changed
        this.element.attr("transform", "translate(" + [this.anchor.x + this.offset.x, this.anchor.y + this.offset.y] + ")");
    },


    setStuck: function(stuck)
    {
        this.stuck = stuck;
    },

    setFollowMouse: function(follow_mouse)
    {
        this.follow_mouse = follow_mouse;
        this.setMouseHandlers();
    },

    setMouseHandlers: function()
    {
        var that = this;
        var parent_out = function()
        {
            //check if we are mousing out of our parent and into ourselves
            var ee = d3.event.toElement;
            var eles = that.element[0][0].childNodes;
            for(i in eles)
            {
                if (ee == eles[i])
                {
                    //need to cancel the event
                    //not sure why stopImmediatePropogation is necessary
                    //d3.event.preventDefault();
                    //d3.event.stopPropagation();
                    d3.event.stopImmediatePropagation();
                    return false;
                }
            }
            that.hide.apply(that, arguments);
        }
        var this_out = function()
        {
            //console.log("HIDE");
            //check if we are mousing out of ourselves and into our parent 
            var ee = d3.event.toElement;
            var eles = that.element[0][0].childNodes;
            for(i in eles)
            {
                if (ee == eles[i])
                {
                    return false;
                }
            }
            //if we are mousing out of the popup into the parent element
            if (ee == that.pelement)
            {
                return false;
            }
            //if we are mousing out of the popup into some other element
            else
            {
                //console.log("exiting to other state");
                //TODO this seems really hacky
                //we are making sure we call the mouseout of the parent element
                d3.select(that.pelement)[0][0].__onmouseout(d3.event);
            }
            that.hide.apply(that, arguments);
        }

        var this_over = function()
        {
        }

        var parent_over = function()
        {
            that.show.apply(that, arguments);
        }

        var parent_move = function()
        {
            //console.log(d3.svg.mouse(that.pelement));
            if(!that.stuck)
            {
                var m = d3.svg.mouse(that.pelement);
                that.setAnchor({"x":m[0], "y":m[1]});
                that.move();
            }
        }
        var parent_click = function()
        {
            that.stuck = !that.stuck;
        }


        //mouse events on parent element
        var papa = d3.select(this.pelement)
            .on("mouseover.dipsy", parent_over)
            .on("mouseout.dipsy", parent_out)
            .on("click.dipsy", parent_click)

        //mouse events on the tooltip itself
        this.element.on("mouseout.dipsy", this_out);
        this.element.on("mouseover.dipsy", this_over);

        //if we want to follow the mouse
        if(this.follow_mouse)
        {
            this.element.on("mousemove.dipsy", parent_move);
            papa.on("mousemove.dipsy", parent_move);
        }
        else
        {
            this.element.on("mousemove.dipsy", null);
            papa.on("mousemove.dipsy", null);
        }

    }

}
