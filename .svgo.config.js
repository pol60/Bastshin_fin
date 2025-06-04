// .svgo.config.js
export default {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            convertPathData: {
              floatPrecision: 2
            }
          }
        }
      },
      'removeXMLNS',
      {
        name: 'convertColors',
        params: {
          currentColor: true
        }
      },
      {
        name: 'addClassesToSVGElement',
        params: {
          classNames: ['icon']
        }
      }
    ]
  };