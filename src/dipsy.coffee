#dipsy, pure svg popups and tooltips for d3
#version 0.0.1
#author: Ian 'enjalot' Johnson, http://visual.ly
#copyright 2011 all rights reserved



dipsy = {}

$(document).ready ->
    class dipsy.Theme extends Backbone.Model
        defaults:
            bg_fill:"#fff"
            bg_fill_opacity:.6
            stroke:"#fff"
            stroke_opacity:.8
            stroke_width:1


    class dipsy.Pop extends Backbone.Model
        defaults:
            #a (css) class to distinguish this tooltip (or at least the collection it belongs to)
            className: ""
            #the view used to render this model
            view: undefined
            
            #unique class of root element (usually the svg element)
            root: undefined
            #unique class of parent element (that the tooltip element is attached to)
            pelement: undefined

            #
            # Positioning related attributes
            #
            #the anchor point for the tooltip
            anchor: {x:0, y:0}
            #offset from the anchor (orientation in a direction like North or South
            offset: {x:0, y:0}
            #center coordinate of the tooltip (relative to the anchor + offset)
            #change this to move the tooltip around 
            center: {x:0, y:0}
            #the coordinate (on the border) where a tether or arrow can be placed
            hitch: (x:0, y:0)

            #size of tooltips box
            size: {w: 100, h: 100}

            #the theme object used to style the tooltip
            theme: new dipsy.Theme()

            #
            # Control related attributes
            #
            #if true this tooltip will respond to mouse events on the parent element 
            handle_mouse: true
            #if true this tooltip will follow the mouse pointer on hover over parent element
            follow_mouse: false
            #if true this tooltip will stay on regardless of mouse movement over parent
            #stuck: false
            posted: false


            #if true this tooltip is moveable by mouse dragging
            drag_move: false
            #if true this tooltip can be moved by force equations (to avoid overcrowding)
            force_move: false
            fixed: true 


            #
            #Collision related attributes
            #
            #a list of neighboring tooltips
            neighbors: undefined
            #a list of tooltips colliding with this one
            colliders: undefined


            #
            # Calculated attributes (should not be explicitly set under most circumstances)
            #

            #nearest viewport element (useful for getting relative positions after transformations)
            nve: undefined
            #tooltip element (a svg:g element to which tooltip contents are appended)
            element: undefined

            #bounding boxes should not be manipulated
            #bounding box of the tooltip
            bbox: undefined
            #bounding box of the parent element
            pbbox: undefined

            #visibility
            visible: false


        initialize: ->
            pelement = @getPelement().node()

            @set(nve: pelement.nearestViewportElement)
            @setContent(@get("content"))
            @setAnchor(@get("anchor"))
            @setOffset(@get("offset"))

            @bind("dipsy:hide", @hide)
            @bind("dipsy:show", @show)

        setAnchor: (point, transform = true) =>
            if(transform)
                pelement = @getPelement().node()
                nve = @get("nve")
                matrix = pelement.getTransformToElement(nve)
                mp = nve.createSVGPoint()
                mp.x = point.x
                mp.y = point.y
                p = mp.matrixTransform(matrix)
                @set(anchor: p)
            else
                @set(anchor: point)

        setCenter: (point, transform = true) =>
            anchor = @get("anchor")
            offset = @get("offset")

            if(transform)
                pelement = @getPelement().node()
                nve = @get("nve")
                matrix = pelement.getTransformToElement(nve)
                mp = nve.createSVGPoint()
                mp.x = point.x
                mp.y = point.y
                p = mp.matrixTransform(matrix)
                #@set(anchor: p)
            else
                p = point
                #@set(anchor: point)

            x = p.x - offset.x - anchor.x
            y = p.y - offset.y - anchor.y
            @set(center: {x: x, y: y})


        setOffset: (offset) =>
            if typeof(offset) == "string"
                size = @get("size")

                switch offset
                    when "center"
                        @set offset: (x: 0, y: 0)
                    when "N"
                        @set offset: (x: 0, y: size.h / 2 + 10)
                    when "S"
                        @set offset: (x: 0, y: -size.h / 2 - 10)
                    when "E"
                        @set offset: (x: size.w + 10, y: 0)
                    when "W"
                        @set offset: (x: -size.w - 10, y: 0)
                    else
                        @set offset: (x: 0, y: 0)
            else if typeof(offset) == "undefined"
                @set offset: (x: 0, y: 0)
            else
                @set offset: offset


        setContent: (content) =>
            #the content attribute is a function which takes a d3 node or selection
            #and appends content to it
            if typeof(content) == "function"
                @set(content: content)
            else
                #default behavior is to make a text element if a non-function is passed in
                @set(content: (ele) ->
                    ele.append("svg:text")
                        .text(content)
                        .attr("x", 5)
                        .attr("y", () ->
                            bbox = @getBBox()
                            return bbox.height + 5
                        )
                )

        getElement: () =>
            d3.select("#" + @get("element"))

        getPelement: () =>
            d3.select("#" + @get("pelement"))

        getRoot: () =>
            d3.select("#" + @get("root"))

        getPos: () =>
            #returns the absolute position of the bounding box
            anchor = @get("anchor")
            offset = @get("offset")
            center = @get("center")
            x = anchor.x + offset.x + center.x
            y = anchor.y + offset.y + center.y
            return x:x, y:y


        hide: () =>
            @set(visible: false)
        show: () =>
            @set(visible: true)

        setPosted: (posted) =>
            @set(posted: posted)

        togglePosted: () =>
            @set(posted: !@get("posted"))



    class dipsy.Pops extends Backbone.Collection
        model: dipsy.Pop
        url: "/"

        initialize: ->
            @bind("add", @addView)
            #@bind("force:stopped", @checkCollisions)

        addView: (pop) =>
            pop.set(view: new dipsy.PopView({model: pop}))

        select: (id) =>
            @find((pop) =>
                pop.get("pelement") == id
            )

        render: =>
            console.log("render all!")
            @each((pop) ->
                view = pop.get("view")
                view.render()
            )

        initForce: (w,h) =>
            @force = d3.layout.force()
                .gravity(0)
                .charge(-50)
                .size([w, h])
                #annealing defaults to .99
                .annealing(.95)

            @nodes = @force.nodes()
            @each((pop) =>
                node = pop.getPos()
                node.cid = pop.cid
                @nodes.push node
            )

            #console.log @nodes

            @force.on("tick", (e) =>
                #console.log(e.alpha, e.stopping)
                if e.stopping
                    @trigger("force:stopped")
                    return true

                k = e.alpha * .1
                @nodes.forEach((node, i) =>
                    pop = @getByCid(node.cid)
                    anchor = pop.get("anchor")
                    node.x += (anchor.x - node.x) * k
                    node.y += (anchor.y - node.y) * k

                    #node.x += .003 * (x - node.x) * -k;
                    #node.y += .003 * (y - node.y) * -k;
                
                    #labels.pops[i].setCleat(node, false);
                    pop.setCenter(node, false)
                )

            )





        startForce: =>
            @force.start()

        stopForce: =>
            @force.stop()

        



    class dipsy.PopView extends Backbone.View

        initialize: ->
            @model.bind "change:anchor", @updatePos
            @model.bind "change:offset", @updatePos
            @model.bind "change:center", @updatePos
            @model.bind "change:size", @updateSize
            @model.bind "change:visible", @updateVisible

            @bind "dipsy:rendered", @setMouseHandlers
            @bind "dipsy:rendered", @updatePos
            @bind "dipsy:rendered", @updateSize
            @bind "dipsy:rendered", @updateTheme
            @bind "dipsy:rendered", @updateVisible



        updateTheme: =>
            element = @model.getElement()
            theme = @model.get("theme").toJSON()
            bgrect = element.select(".dipsy_bgrect")
                .attr("stroke", theme.stroke)
                .attr("stroke-opacity", theme.stroke_opacity)
                .attr("stroke-width", theme.stroke_width)
                .attr("fill", theme.bg_fill)
                .attr("fill-opacity", theme.bg_fill_opacity)

        updateVisible: =>
            visible = if @model.get("visible") then "visible" else "hidden"
            element = @model.getElement()
                .attr("visibility", visible)

        updateSize: =>
            #TODO: we can tween here
            element = @model.getElement()
            size = @model.get("size")
            bgrect = element.select(".dipsy_bgrect")
                .attr("width", size.w)
                .attr("height", size.h)

        updatePos: =>
            #TODO: we can tween here
            element = @model.getElement()
            pos = @model.getPos()
            size = @model.get("size")
            element.attr("transform", "translate(" + [pos.x - size.w / 2, pos.y - size.h / 2] + ")")



        render: =>
            #console.log(@model)
            if _.isUndefined(@model.get("element"))
                root = @model.getRoot()
                elid = "dipsy_pop_" + @model.get("className") + "_" + @model.cid
                element = root.append("svg:g")
                    .attr("id", elid)

                bgrect = element.append("svg:rect")
                    .attr("class", "dipsy_bgrect")
                @model.set(element: elid)
            else
                element = @model.getElement()
                element.select(".dipsy_content").remove()

            #model's content is a function that expects an element to append to
            content = element.append("svg:g")
                .attr("class", ".dipsy_content")
            @model.get("content")(content)
            @trigger("dipsy:rendered")


        setMouseHandlers: () =>
            #TODO: should make dipsy event/mouse handlers. Need to be able to
            #intercept events before they trigger parent element mouse handlers
            #maybe use jQuery events
            parent_out = () =>
                #check if we are mousing out of our parent and into ourselves
                ee = d3.event.toElement
                #eles = that.element[0][0].childNodes
                eles = @model.getElement().node().childNodes
                for e in eles
                    if ee == e #eles[i]
                        console.log("CANCEL")
                        #need to cancel the event
                        #not sure why stopImmediatePropogation is necessary
                        #d3.event.preventDefault()
                        #d3.event.stopPropagation()
                        d3.event.stopImmediatePropagation()
                        false
                if !@model.get("posted")
                    #trigger hide
                    @model.trigger("dipsy:hide")
                    #that.hide.apply(that, arguments);
                    
            this_out = () =>
                #console.log("HIDE");
                #check if we are mousing out of ourselves and into our parent 
                ee = d3.event.toElement
                #eles = that.element[0][0].childNodes
                pelement = @model.getPelement().node()
                eles = @model.getElement().node().childNodes
                #console.log(eles)
                #console.log(pelement)
                #console.log(ee)
                #console.log(eles)
                #TODO: figure out why mousing into children elements cancels
                for e in eles
                    if ee == e #eles[i]
                        return false

                #if we are mousing out of the popup into the parent element
                if (ee == pelement)
                    false
                else
                    #if we are mousing out of the popup into some other element
                    #we are making sure we call the mouseout of the parent element
                    #console.log("exiting to other state");
                    #TODO this seems really hacky
                    #console.log(pelement.__onmouseout)
                    if(pelement.__onmouseout)
                        pelement.__onmouseout(d3.event)
                if(!@model.get("posted"))
                    @model.trigger("dipsy:hide")

            this_over = () =>
                false

            parent_over = () =>
                #console.log("parent over")
                @model.trigger("dipsy:show")

            parent_move = () =>
                #console.log("parent move")
                if(!@model.get("posted"))
                    pelement = @model.getPelement().node()
                    m = d3.svg.mouse(pelement)
                    @model.setAnchor({"x":m[0], "y":m[1]})
                    #that.move();
                   
            parent_click = () =>
                @model.togglePosted()

            if(@model.get("handle_mouse"))
                #mouse events on parent element
                dclass = @model.get("className")
                papa = @model.getPelement()
                    .on("mouseover.dipsy_"+dclass, parent_over)
                    .on("mouseout.dipsy_"+dclass, parent_out)
                    .on("click.dipsy_"+dclass, parent_click)

                #mouse events on the tooltip itself
                element = @model.getElement()#.node()
                element.on("mouseout.dipsy_"+dclass, this_out)
                element.on("mouseover.dipsy_"+dclass, this_over)

                #if we want to follow the mouse
                if(@model.get("follow_mouse"))
                    element.on("mousemove.dipsy_"+dclass, parent_move)
                    papa.on("mousemove.dipsy_"+dclass, parent_move)
                else
                    element.on("mousemove.dipsy_"+dclass, null)
                    papa.on("mousemove.dipsy_"+dclass, null)
            else
                dclass = @model.get("className")
                papa = @model.getPelement() #d3.select(this.pelement)
                    .on("mouseover.dipsy_"+dclass, null)
                    .on("mouseout.dipsy_"+dclass, null)
                    .on("click.dipsy_"+dclass, null)

                #mouse events on the tooltip itself
                element = @model.getElement()
                element.on("mouseout.dipsy_"+dclass, null)
                element.on("mouseover.dipsy_"+dclass, null)
                false



