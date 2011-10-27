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
            stuck: false

            #if true this tooltip is moveable by mouse dragging
            drag_move: false
            #if true this tooltip can be moved by force equations (to avoid overcrowding)
            force_move: false

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



        initialize: ->
            console.log "init!!!"
            pelement = @getPelement().node()
            @set(nve: pelement.nearestViewportElement)
            @setContent(@get("content"))
            @setAnchor(@get("anchor"))
            @setOffset(@get("offset"))

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

        setOffset: (offset) =>
            console.log(offset)
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
            d3.select("." + @get("element"))

        getPelement: () =>
            d3.select("." + @get("pelement"))

        getRoot: () =>
            d3.select("." + @get("root"))



    class dipsy.Pops extends Backbone.Collection
        model: dipsy.Pop
        url: "/"

        initialize: ->
            @bind("add", @addView)

        addView: (pop) =>
            pop.set(view: new dipsy.PopView({model: pop}))


        render: =>
            console.log("render all!")
            @each((pop) ->
                pop.get("view").render()
            )




    class dipsy.PopView extends Backbone.View

        initialize: ->
            @model.bind "change:anchor", @updatePos
            @model.bind "change:offset", @updatePos
            @model.bind "change:center", @updatePos

            @model.bind "change:size", @updateSize


        updateTheme: =>
            element = @model.getElement()
            theme = @model.get("theme").toJSON()
            bgrect = element.select(".dipsy_bgrect")
                .attr("stroke", theme.stroke)
                .attr("stroke-opacity", theme.stroke_opacity)
                .attr("stroke-width", theme.stroke_width)
                .attr("fill", theme.bg_fill)
                .attr("fill-opacity", theme.bg_fill_opacity)

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
            anchor = @model.get("anchor")
            offset = @model.get("offset")
            center = @model.get("center")
            size = @model.get("size")
            x = anchor.x + offset.x + center.x - size.w / 2
            y = anchor.y + offset.y + center.y - size.h / 2
            element.attr("transform", "translate(" + [x, y] + ")")



        render: =>

            #console.log(@model)
            if _.isUndefined(@model.get("element"))
                root = @model.getRoot()
                elid = "dipsy_pop_" + @model.get("className") + "_" + @model.cid
                element = root.append("svg:g")
                    .attr("class", elid)

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

            @updatePos()
            @updateSize()
            @updateTheme()





