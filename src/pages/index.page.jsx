/* eslint-disable react/jsx-props-no-spreading */
import Home from '@src/pages/components/home/Index';
import About from '@src/pages/components/about/Index';
import Quote from '@src/pages/components/quote/Index';
import Projects from '@src/pages/components/projects/Index';
import CustomHead from '@src/components/dom/CustomHead';

const seo = {
  title: '刘耀翔｜视觉设计与 AIGC 作品集',
  description:
    '刘耀翔的个人作品集，涵盖视觉设计、染织艺术、AIGC、智能工作流与数字产品。',
  keywords: [
    '刘耀翔',
    '鲁迅美术学院',
    '视觉设计',
    '染织艺术设计',
    'AIGC',
    '作品集',
  ],
};

function Page() {
  return (
    <>
      <CustomHead {...seo} />
      <Home />
      <About />
      <Quote />
      <Projects />
    </>
  );
}

export default Page;
