import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedOrigins,exactOrigin,rejectCrossOriginWrite,browserSecurityHeaders} from '../src/lib/securityPolicy.ts';

const origins=allowedOrigins('https://smarttracker.cloud,https://www.smarttracker.cloud',false);
test('same-origin writes pass and cross-site, missing/null and sibling origins fail',()=>{
  for(const method of ['POST','PUT','PATCH','DELETE']){
    const request=origin=>new Request('https://smarttracker.cloud/api/devices',{method,headers:origin?{origin}:undefined});
    assert.equal(rejectCrossOriginWrite(request('https://smarttracker.cloud'),origins),false);
    for(const origin of [null,'null','https://attacker.example','https://www.smarttracker.cloud']) assert.equal(rejectCrossOriginWrite(request(origin),origins),true);
  }
});
test('read-only requests need no Origin',()=>assert.equal(rejectCrossOriginWrite(new Request('https://smarttracker.cloud/api/devices'),origins),false));
test('trusted external Origin uses Host rather than the framework internal rewrite address',()=>assert.equal(rejectCrossOriginWrite(new Request('http://localhost:8080/api/devices',{method:'POST',headers:{origin:'https://smarttracker.cloud',host:'smarttracker.cloud'}}),origins),false));
test('explicit cross-site Fetch Metadata blocks writes',()=>assert.equal(rejectCrossOriginWrite(new Request('https://smarttracker.cloud/api/devices',{method:'POST',headers:{origin:'https://smarttracker.cloud','sec-fetch-site':'cross-site'}}),origins),true));
test('wildcards, credentials, paths and non-HTTP origins are not trusted',()=>{
  for(const origin of ['https://*.vercel.app','https://name:password@example.test','https://example.test/path','javascript:alert(1)']){
    assert.equal(exactOrigin(origin),null);assert.throws(()=>allowedOrigins(origin,false));
  }
});
test('production script policy requires nonce and avoids unsafe script evaluation',()=>{
  const headers=browserSecurityHeaders('bm9uY2U=',true,'https://api.smarttracker.cloud');
  const script=headers['Content-Security-Policy'].split(';').find(value=>value.trim().startsWith('script-src'));
  assert.ok(script.includes("'nonce-bm9uY2U='"));assert.ok(!script.includes('unsafe-inline'));assert.ok(!script.includes('unsafe-eval'));
  assert.ok(headers['Content-Security-Policy'].includes("frame-ancestors 'none'"));assert.ok(headers['Strict-Transport-Security']);
  assert.equal(headers['X-Content-Type-Options'],'nosniff');assert.equal(headers['X-Frame-Options'],'DENY');
});
test('development eval allowance is not present in production and nonce cannot inject directives',()=>{
  assert.ok(browserSecurityHeaders('bm9uY2U=',false)['Content-Security-Policy'].includes('unsafe-eval'));
  assert.throws(()=>browserSecurityHeaders("bad'; default-src *",true));
});
