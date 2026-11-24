#version 330
in vec2 uv;
out vec4 frag;
uniform sampler2D page;
uniform int shot;
uniform float phase;
uniform float cropLeft;
uniform float cropWidth;
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
float band(float x,float lo,float hi,float edge){return smoothstep(lo,lo+edge,x)*(1.-smoothstep(hi-edge,hi,x));}
vec3 lamp(vec3 c,vec2 p,vec2 origin,float angle,float dir,float level){
  vec2 v=(p-origin)*vec2(1.777,.999);float along=v.x*dir;
  float width=.003+.059*max(along,0.);float axis=(v.y-along*angle)/width;
  float beam=exp(-axis*axis)*exp(-max(along,0.)*1.7)*smoothstep(0.,.021,along);
  float flare=exp(-length(v)*127.);
  return c+vec3(1.,.75,.40)*level*(.30*beam+.58*flare);
}
void main(){
  vec2 p=vec2(cropLeft+cropWidth*uv.x,uv.y);float a=phase;
  vec3 c;
  if(shot==0){
    vec2 center=vec2(.650,.494);
    vec2 d=(p-center)*vec2(1.777,1.);
    float rad=length(d),theta=atan(d.y,d.x);
    // Light travels around stationary glass. Keep the brass frame and lens edges registered.
    vec2 flame=(p-center)/vec2(.014,.049);
    float fire=exp(-dot(flame,flame)*1.1);
    p.x+=fire*(.0018*sin(2.*a+.5)+.0009*sin(3.*a+p.y*41.));
    p.y+=fire*.0024*cos(2.*a);
    c=texture(page,p).rgb;
    float prism=.64+.36*cos(rad*103.+1.8*sin(theta));
    float sweep=pow(max(0.,cos(theta-a-.4)),7.);
    float glancing=pow(max(0.,cos(theta-a+2.7)),14.);
    float exposed=smoothstep(.10,.67,lum(c));
    c*=.86+.18*sweep+.07*glancing;
    c+=vec3(1.,.813,.54)*exposed*(.24*sweep+.08*glancing)*prism;
    c+=vec3(.12,.062,.017)*exp(-rad*13.)*(.6+.4*cos(2.*a));
  }else if(shot==1){
    vec2 s=p;
    float deep=smoothstep(.621,.968,p.y);
    float edge=mix(.346,.083,smoothstep(.626,.94,p.y));
    float water=deep*smoothstep(edge-.030,edge+.028,p.x);
    water=max(water,.66*smoothstep(.80,.93,p.y));
    float swell=sin(a+s.y*27.+s.x*10.);
    p.x+=water*(.0072*swell+.0023*sin(2.*a-s.y*69.+s.x*7.));
    p.y+=water*(.0057*sin(a+s.x*14.+s.y*23.)+.0018*cos(2.*a-s.x*29.));
    c=texture(page,p).rgb;
    c+=vec3(.063,.076,.075)*water*smoothstep(.23,.59,lum(c))*(.5+.5*sin(2.*a+s.y*77.+s.x*51.));
    c=lamp(c,s,vec2(.189,.287),.10+.15*sin(a-.3),1.,.26+.78*(.5+.5*cos(a-.75)));
  }else if(shot==2){
    float win=band(p.x,mix(.49,.337,p.y),1.-.097*p.y,.009)*(1.-smoothstep(.695+.116*p.x,.710+.116*p.x,p.y));
    vec2 s=p;
    vec2 d=(p-vec2(.70,.447))*vec2(1.777,1.);
    float r=.014*sin(a+.21);
    vec2 rolling=(mat2(cos(r),-sin(r),sin(r),cos(r))*d-d)/vec2(1.777,1.);
    // The wheelhouse is the stable reference. The horizon rises and rolls through the glass.
    p+=win*(rolling+vec2(.002*cos(a),.007*sin(a-.4)));
    float water=win*smoothstep(.445,.63,p.y);
    p.x+=water*.0049*sin(a+s.y*36.);
    p.y+=water*.0037*sin(2.*a+s.x*21.+s.y*18.);
    c=texture(page,p).rgb;
    c=mix(c,lamp(c,p,vec2(.783,.346),.05+.09*sin(a),-1.,.25+.7*pow(.5+.5*cos(a),3.)),win);
    float bulb=exp(-length((s-vec2(.377,.080))*vec2(1.777,1.))*16.);
    c+=vec3(.064,.032,.006)*bulb*(.5+.5*sin(a+.6));
  }else{
    vec2 s=p;
    // Tiny pendulums have different lever lengths. Soft local masks exclude the wood frame.
    for(int i=0;i<3;i++){
      float x=i==0?.244:(i==1?.393:.532);
      float y=i==0?.00:(i==1?.025:.042);
      float w=i==1?.089:.046;
      float mobile=band(p.x,x-w,x+w,.009)*band(p.y,.015,.254,.03);
      p.x+=mobile*(p.y-y)*.061*sin(a+float(i)*.87);
      p.y+=mobile*(s.x-x)*.096*sin(a+float(i)*.87);
    }
    float water=band(s.y,.44,.756,.043)*band(s.x,.077,.37,.045);
    p.x+=water*.004*sin(a+s.y*29.);
    p.y+=water*.0048*sin(a+s.x*13.+s.y*26.);
    c=texture(page,p).rgb;
    float lit=.5+.5*cos(a+.6);
    c+=vec3(.55,.32,.067)*exp(-length((s-vec2(.166,.441))*vec2(1.777,1.))*109.)*(.25+.75*lit);
    c+=vec3(.038,.019,.003)*smoothstep(.35,.70,lum(c))*lit*smoothstep(.38,.78,s.x);
  }
  frag=vec4(c,1.);
}

