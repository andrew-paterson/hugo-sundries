function categories(CMS) {
    var CategoriesControl = createClass({
    handleChange: function(e) {
      const separator = this.props.field.get('separator', ', ')
      this.props.onChange(e.target.value.split(separator).map((e) => e.trim()));
    },

    render: function() {
      const separator = this.props.field.get('separator', ', ');
      var value = this.props.value;
      return h('input', {
        id: this.props.forID,
        className: this.props.classNameWrapper,
        type: 'text',
        value: value ? value.join(separator) : '',
        onChange: this.handleChange,
      });
    },
  });

  var CategoriesPreview = createClass({
    render: function() {
      return h('ul', {},
        this.props.value.map(function(val, index) {
          return h('li', {key: index}, val);
        })
      );
    }
  });

  var schema = {
    properties: {
      separator: { type: 'string' },
    },
  }

  CMS.registerWidget('categories', CategoriesControl, CategoriesPreview, schema);
}

export default categories ;