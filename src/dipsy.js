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
    //do we replace the tooltip or add a new one?


    //options
    //this.follow_mouse = false;
}


dipsy.Pops.prototype = 
{
    add: function(element, content)
    {
        var newpop = 
        new dipsy.Pop(  this.root,
                        this.pops.length, 
                        element,
                        content);
        this.pops.push( newpop );
    },
}

dipsy.Pop = function(root, id, pelement, content)
{
    //this.event = d3.dispatch("dipsy");
    this.id = id;
    this.pelement = pelement;
    var pbbox = pelement.getBBox();
    this.parent_bbox = pbbox;
    this.content = content;
    //this.nve = pelement.nearestViewportElement;

    this.follow_mouse = true;

    this.anchor = { "x": pbbox.x + pbbox.width/2,
                    "y": pbbox.y + pbbox.height/2}


    var that = this;

    this.element = root.append("svg:g")
        .attr("class", "dipsy_pop")

    var bgrect = this.element.append("svg:rect");

    if(typeof(content) == "function")
    {
        //console.log(this.element);
        //console.log(content);
        content(this.element);
    }
    // if(typeof(content) == "string")
    else
    {
        this.element.append("svg:text")
            .text(content)
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

    this.element.attr("transform", "translate(" + [ this.anchor.x + this.offset.x, this.anchor.y + this.offset.y] + ")");
    var parent_out = function()
    {
        //check if we are mousing out of our parent and into ourselves
        var ee = d3.event.toElement;
        var eles = that.element[0][0].childNodes;
        for(i in eles)
        {
            if (ee == eles[i])
            {
                //console.log("out of state into tooltip!");
                //need to cancel the event
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
        /*
        var matrix = that.pelement.getScreenCTM();
        var mp = that.nve.createSVGPoint();
        mp.x = d3.event.clientX;
        mp.y = d3.event.clientY;
        var sp = mp.matrixTransform(matrix.inverse());
        //that.element.attr("transform", "translate(" + [that.offset.x + sp.x, that.offset.y + sp.y] + ")");
        */
        //console.log(d3.svg.mouse(that.pelement));
        var m = d3.svg.mouse(that.pelement);
        that.element.attr("transform", "translate(" + [that.offset.x + m[0], that.offset.y + m[1]] + ")");
    }


    //mouse events on parent element
    var papa = d3.select(this.pelement)
        .on("mouseover.dipsy", parent_over)
        .on("mouseout.dipsy", parent_out)

    //mouse events on the tooltip itself
    this.element.on("mouseout.dipsy", this_out);
    this.element.on("mouseover.dipsy", this_over);

    //if we want to follow the mouse
    if(this.follow_mouse)
    {
        this.element.on("mousemove.dipsy", parent_move);
        papa.on("mousemove.dipsy", parent_move);
    }

    this.hide();
}

dipsy.Pop.prototype = {
    show: function()
    {
        //console.log("show");
        this.element.attr("visibility", "visible");
    },

    hide: function()
    {
        //console.log("hide");
        this.element.attr("visibility", "hidden");
    },

    remove: function()
    {
        //console.log("remove");
    },
}
