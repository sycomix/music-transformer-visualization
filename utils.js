export { TYPES, svgNS, 
    COLORS, 
    LOCAL_COLORS_ALL, GLOBAL_COLORS_ALL, 
    LOCAL_COLORS_SINGLE, GLOBAL_COLORS_SINGLE,
    rgb, 
    getColorForWeight, scaleArray,
    makeOption, makeHeadSelector, scaleNote,
    makeRect, makePath, makeLine, getConnectorLocation};

const TYPES = {BACH: 'bach', PERFORMANCE: 'performance', DOUBLE: 'double_bach'};

function scaleArray(arr) {
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const range = max - min;
  const scaled = [];
  for (let i = 0; i < arr.length; i++) {
    scaled.push((arr[i] - min) / range);
  }
  return scaled;
}

/**************
 * Colour Helpers
 **************/
const COLORS = [
  {min: rgb('ffd6d6'), max: rgb('e6194B')}, // red
  {min: rgb('ffdac3'), max: rgb('f58231')}, // orange
  {min: rgb('efe2bc'), max: rgb('ffe119')},// yellow
  {min: rgb('cdeaca'), max: rgb('3cb44b')}, // green
  {min: rgb('b0edef'), max: rgb('6bb9bc')}, // cyan
  {min: rgb('d9e1ff'), max: rgb('448aff')}, // blue
  {min: rgb('f0dbfe'), max: rgb('68529A')}, // purple
  {min: rgb('dbe0ff'), max: rgb('546e7a')} // navy
];

// In two-attention mode, when painting the same head the colours need to be different
const LOCAL_COLORS_SINGLE = COLORS;
const GLOBAL_COLORS_SINGLE = [
  {min: rgb('dbe0ff'), max: rgb('546e7a')}, // navy
  {min: rgb('f0dbfe'), max: rgb('68529A')}, // purple
  {min: rgb('d9e1ff'), max: rgb('448aff')},// blue
  {min: rgb('b0edef'), max: rgb('6bb9bc')}, // cyan
  {min: rgb('cdeaca'), max: rgb('3cb44b')}, // green
  {min: rgb('efe2bc'), max: rgb('ffe119')}, // yellow
  {min: rgb('ffdac3'), max: rgb('f58231')}, // orange
  {min: rgb('ffd6d6'), max: rgb('e6194B')} // red
];

// In two-attention mode, when painting all heads, just use two different colours.
const LOCAL_COLORS_ALL = [ // red
  {min: rgb('ffd6d6'), max: rgb('e6194B')}, 
  {min: rgb('ffd6d6'), max: rgb('e6194B')},
  {min: rgb('ffd6d6'), max: rgb('e6194B')},
  {min: rgb('ffd6d6'), max: rgb('e6194B')},
  {min: rgb('ffd6d6'), max: rgb('e6194B')},
  {min: rgb('ffd6d6'), max: rgb('e6194B')}, 
  {min: rgb('ffd6d6'), max: rgb('e6194B')},
  {min: rgb('ffd6d6'), max: rgb('e6194B')} 
];
const GLOBAL_COLORS_ALL = [ // green
  {min: rgb('cdeaca'), max: rgb('3cb44b')}, 
  {min: rgb('cdeaca'), max: rgb('3cb44b')},
  {min: rgb('cdeaca'), max: rgb('3cb44b')},
  {min: rgb('cdeaca'), max: rgb('3cb44b')},
  {min: rgb('cdeaca'), max: rgb('3cb44b')},
  {min: rgb('cdeaca'), max: rgb('3cb44b')}, 
  {min: rgb('cdeaca'), max: rgb('3cb44b')},
  {min: rgb('cdeaca'), max: rgb('3cb44b')} 
];

function rgb(hex) {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

function getColorForWeight(weight, colors) {
  // Make big weights darker.
  if (weight > 0.5) {
    return shadeRGBColor(colors.max, 1 - weight);
  } else if (weight < 0.1) {
    const one = blendRGBColors(colors.min, colors.max, weight);
    return shadeRGBColor(one, 0.2);
  } else {
    return blendRGBColors(colors.min, colors.max, weight);
    //return blendRGBColors(one, this.musicColor, 0.1);
  }
}

function shadeRGBColor(color, percent) {
  const f=color.split( ', '),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
  return  'rgb('+(Math.round((t-R)*p)+R)+ ', '+(Math.round((t-G)*p)+G)+ ', '+(Math.round((t-B)*p)+B)+ ') ';
}

function blendRGBColors(c0, c1, p) {
  const f=c0.split( ', '),t=c1.split( ', '),R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
  return  'rgb('+(Math.round((parseInt(t[0].slice(4))-R)*p)+R)+ ', '+(Math.round((parseInt(t[1])-G)*p)+G)+ ', '+(Math.round((parseInt(t[2])-B)*p)+B)+ ') ';
}
  
/**************
 * DOM Helpers
 **************/
function makeOption(i) {
  const option = document.createElement('option');
  option.textContent = i;
  return option;
}

function makeHeadSelector(i, updateFn) {
  const div = document.createElement('div');
  div.style.display = 'inline-block';
  const input = document.createElement('input');
  input.checked = true;
  input.type = 'checkbox';
  input.id = 'head' + i;
  input.onchange = updateFn;
  const label = document.createElement('label');
  label.setAttribute('for', input.id);
  label.style.backgroundColor = COLORS[i].max;
  div.appendChild(input);
  div.appendChild(label);
  return div;
}

/**************
 * SVG Helpers
 **************/
const svgNS = 'http://www.w3.org/2000/svg';

function makeRect(which, x, y, w, h, fill="red", pitch) {
  const rect = document.createElementNS(svgNS, 'rect');
  if (which !== null && which !== undefined) {
    rect.dataset.index = which;
    rect.setAttribute('class', 'hover');
  }
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('fill', fill);

  const title = document.createElementNS(svgNS, 'title');
  title.textContent = pitch;
  rect.appendChild(title);
  return rect;
}

function makeLine(x, y, x2, y2, pitch) {
  const line = document.createElementNS(svgNS, 'line');
  line.dataset.index = pitch;
  line.setAttribute('x1', x);
  line.setAttribute('y1', y);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', 2);
  const title = document.createElementNS(svgNS, 'title');
  title.textContent = pitch;
  line.appendChild(title);
  return line;
}

function makePath(from, to, head, value, color, noteWidth, isCircle) {
  const path = document.createElementNS(svgNS,'path');
  if (isCircle) {
    /* omfg svgs.
    Mx,y -- move to x,y
    arx,ry -- radius of the arc. 1,1 is a circle, 2,1 is a squishier ellipse
    0 -- axis rotation
    0 -- large-arc-flag, whether it's the small or big circle
    0 -- sweep-flag, 1 is mirrored
    100,0 - length of arc
    -->
    <path d="M100,100 
             a1,1 
             0 
             0,1 
             100,0" />
     */
    const sweep = to.y <= from.y ? 0 : 1;
    path.setAttribute('d',
    `M ${from.x} ${from.y} 
     a1,1
     0, 
     1, ${sweep},
     ${to.x - from.x} ${to.y-from.y}`);
    
    // This is a made up number.
    const strokeWidth = value * Math.max(4, noteWidth / 5);
    path.setAttribute('stroke-width', Math.max(1, strokeWidth));
    path.setAttribute('stroke-opacity', value);
  } else {
    const distX = Math.abs(to.x - from.x);
    const distY = Math.abs(to.x - from.x);
    const dirX = from.x < to.x ? 1 : -1;
    const dirY = from.y < to.y ? 1 : -1;

    const percentX = 0.5;
    const percentY = 0.25;

    // Bezier control for from point.    
    const x1 = from.x + dirX * (percentX * distX);
    const y1 = from.y; // from.y + dirY * (percentY * distY);

    // Bezier control for the second point.
    const x2 = to.x - dirX * ((1-percentX) * distX);
    const y2 = to.y; //to.y - dirY * ((1-percentY) * distY);
    
    // Add an offset to the control points so that not all notes overlap.
    const  offset = (head + 1) * noteWidth / 16;
    //offset = head % 2 ? -offset : +offset;
    const offsetX = dirX * offset;
    const offsetY = dirY * offset;

    path.setAttribute('d',
        `M ${from.x} ${from.y} C ${x1+offsetX} ${y1}, ${x2-offsetX} ${y2}, ${to.x} ${to.y}`);
    
    // This is a made up number.
    const strokeWidth = Math.floor(value * 10) - 6.5;
    path.setAttribute('stroke-width', Math.max(1, strokeWidth));
  }

  path.setAttribute('stroke', color);
  path.setAttribute('fill', 'none');
      
  const title = document.createElementNS(svgNS, 'title');
  title.textContent = value;
  path.appendChild(title);
  return path;
}

function getConnectorLocation(el, where='middle') {
  const x = parseInt(el.getAttribute('x'));
  const y = parseInt(el.getAttribute('y'));
  const w = parseInt(el.getAttribute('width'));
  const h = parseInt(el.getAttribute('height'));
  const middleX = x + w/2;
  const middleY = y + h/2;
  switch (where) {
    case 'middle':
      return {x : middleX, y: middleY};
    case 'top':
      return {x : middleX, y: y};
    case 'bottom':
      return {x : middleX, y: y+h};
    case 'left':
      return {x : x, y: middleY};
    case 'right':
      return {x : x+w, y: middleY};
  }
}

function scaleNote(el) {
  // Scale it a bit unless it's a time because that looks weird
  const x_ = parseInt(el.getAttribute('x'));
  const y_ = parseInt(el.getAttribute('y'));
  el.setAttribute('transform', `translate(${x_} ${y_}) scale(1 2.5) translate(-${x_} -${y_+2})`);
}





/**************
 * Unused but saving for later
 **************/
function randomizeWeights(url) {
  fetch(url)
  .then((response) => response.json())
  .then((json) => {
    // Rename attention_weights to global_attention
    json["global_weights"] = json["attention_weights"];
    delete json["attention_weights"];

    // Copy the global weights over.
    json["local_weights"] = JSON.parse(JSON.stringify(json["global_weights"]));

    // Randomize them.
    for (let layer = 0; layer < json["local_weights"].length; layer++) {
      const heads = json["local_weight_"][layer][0];
      for (let head = 0; head < heads.length; head++) {
        const weights = heads[head];
        for (let step = 0; step < weights.length; step++) {
          const values = weights[step];
          for (let i = 0; i < values.length; i++) {
            // Change this value slightly.
            values[i] += mm.tf.randomNormal([1], 0, 0.2).get(0);
          }
        }

      }
    }
    console.log(JSON.stringify(json));
  });
}