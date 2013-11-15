/** @jsx React.DOM */

var React = require('React');

var GlassViewport = require('./GlassViewport');
var StyleKeys = require('../environment/StyleKeys');

require('./GlassContainer.css');

function shallowCopy(x) {
  var y = {};
  for (var z in x) {
    if (!x.hasOwnProperty(z)) {
      continue;
    }
    y[z] = x[z];
  }
  return y;
}

function cloneChildren(children) {
  if (React.isValidComponent(children)) {
    return cloneComponent(children);
  } else if (Array.isArray(children)) {
    return children.map(cloneComponent);
  } else if (!children) {
    return null;
  } else {
    var r = {};
    for (var k in children) {
      if (!children.hasOwnProperty(k)) {
        continue;
      }
      r[k] = cloneComponent(children[k]);
    }
    return r;
  }
}

function cloneComponent(component) {
  if (!React.isValidComponent(component)) {
    // string or something
    return component;
  }
  var newInstance = new component.constructor();
  var newChildren = cloneChildren(component.props.children);
  var newProps = shallowCopy(component.props);
  delete newProps.children;
  newInstance.construct(newProps, newChildren);
  return newInstance;
}

var GlassContainer = React.createClass({
  getDefaultProps: function() {
    return {style: {}, overlays: {}};
  },

  render: function() {
    var viewports = [
      <GlassViewport
        key="content"
        glassContent={this.props.children}
        left={this.props.content.left}
        top={this.props.content.top}
        width={this.props.content.width}
        height={this.props.content.height}
        style={this.props.content.style}
      />
    ];

    for (var key in this.props.overlays) {
      var overlay = this.props.overlays[key];

      // TODO: this is a hack!
      var clonedChildren = cloneChildren(this.props.children);

      clonedChildren.props = shallowCopy(clonedChildren.props);
      clonedChildren.props.style = shallowCopy(clonedChildren.props.style || {});
      clonedChildren.props.style[StyleKeys.FILTER] = 'blur(5px)';

      viewports.push(
        <GlassViewport
          key={key}
          glassContent={clonedChildren}
          left={overlay.left}
          top={overlay.top}
          width={overlay.width}
          height={overlay.height}
          style={overlay.style}>
          {overlay.children}
        </GlassViewport>
      );
    }

    return this.transferPropsTo(
      <div className="GlassContainer">
        {viewports}
      </div>
    );
  }
});

module.exports = GlassContainer;