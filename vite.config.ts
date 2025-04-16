import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { visualizer } from 'rollup-plugin-visualizer'
import { Plugin as importToCDN } from 'vite-plugin-cdn-import'
export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: true }),
    importToCDN({
      modules: [
        {
          // 引入时的包名
          name: 'element-plus',
          // app.use(), 全局注册时分配给模块的变量
          var: 'element-plus',
          // 根据自己的版本号找到对应的CDN网址
          path: 'https://unpkg.com/element-plus@2.4.1/dist/index.full.js',
          // 根据自己的版本号找到对应的CDN网址
         // css: 'https://unpkg.com/@arco-design/web-vue@2.47.1/dist/arco.css',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },


  server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        }
      }
    },
});















  // build: {
  //   rollupOptions: {
  //     input: resolve(__dirname, 'src/views/index.html'), // 确保输入路径正确
  //   },
  // },
  // server: {
  //   port: 3000,
  //   open: true,
  //   // 配置代理
  //   proxy: {
  //     // 请求的路径前缀只要是 /testaxios 就会被拦截走这个代理
  //     '/oss': {
  //     /**
  //       *  请求的目标资源再经过替换成 /httphwm/getList 后，
  //       *  会加上 http://127.0.0.1:9693 这个前缀，
  //       *  最后请求的URL为: http://127.0.0.1:9693/httphwm/getList
  //       */
  //       target: 'http://localhost:8080/',
  //       ws: true,
  //       changeOrigin: true,
  //       // 拦截到的请求路径 testaxios/httphwm/getList，/testaxios会被替换成空
  //       rewrite: (path) => path.replace(/^\/oss/, 'oss'),
  //     },
  //   },
  // }