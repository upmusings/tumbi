'use strict';

const DB = {};

function Indental (data) {
  this.data = data;

  this.parse = (type) => {
    const lines = this.data.split('\n').map(liner);

    // Assoc lines
    let stack = {};
    let target = lines[0];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.skip) continue;
      target = stack[line.indent - 2];
      if (target) target.children[target.children.length] = line;
      stack[line.indent] = line;
    }

    // Format
    let h = {};

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.skip || line.indent > 0) continue;
      let key = line.content.toUpperCase();
      let unde = 'Home';
      let typ = 'page';

      if (key.indexOf('@') > -1) {
        key = key.slice(2);
        typ = key === 'HOME' ? 'home' : 'portal';
      } else if (key.indexOf('+') > -1) {
        key = key.slice(2);
        typ = key === 'HOME' ? 'home' : 'index';
      } else if (key.indexOf('!') > -1) {
        key = key.slice(2);
        typ = key === 'HOME' ? 'home' : 'status';
      }

      if (key.indexOf('.') > -1) {
        const split = key.split('.');
        unde = split[0];
        key = split[1];
      }

      line = format(line);

      h[key] = type
        ? new type(key, line, capitalise(unde), typ) : line;
    }

    return h;
  }

  function format (line) {
    let a = [];
    let h = {};

    const {children} = line;

    for (let i = 0; i < children.length; i++) {
      const child = line.children[i];
      const {key, children, value, content} = child;

      if (key) {
        h[key] = value;
      } else if (children.length === 0 && content) {
        a[a.length] = content;
      } else {
        h[content] = format(child);
      }
    }

    return a.length > 0 ? a : h;
  }

  function liner (line) {
    let key = null;
    let value = null;

    if (line.indexOf(' : ') > -1) {
      const split = line.split(' : ');
      value = split[1].trim();
      key = split[0].trim();
    }

    return {
      skip: line === '' || line.substr(0, 1) === '~',
      indent: line.search(/\S|$/),
      content: line.trim(),
      children: [],
      value,
      key,
    }
  }
}