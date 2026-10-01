import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 fullyParallel:true,
 reporter:'list',
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome'],...(process.env.CI?{}:{channel:'msedge'})}},
  {name:'ipad-webkit',testMatch:'**/clipboard.spec.mjs',use:{...devices['iPad Pro 11'],browserName:'webkit'}}
 ],
 webServer:{command:'npm run preview',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});
