import AppearTitle from '@src/components/animationComponents/appearTitle/Index';
import ButtonLink from '@src/components/animationComponents/buttonLink/Index';
import Image from 'next/image';
import clsx from 'clsx';
import { gsap } from 'gsap';
import styles from '@src/pages/components/about/styles/about.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';
import { useRef } from 'react';
import site from '@src/constants/site';

function About() {
  const isMobile = useIsMobile();
  const rootRef = useRef();
  const animatedImageRef = useRef();

  const setupScrollAnimation = () => {
    const ctx = gsap.context(() => {
      gsap.set(animatedImageRef.current, { top: !isMobile ? '-20vw' : '0' });
      if (!isMobile) {
        gsap.to(animatedImageRef.current, {
          top: '20vw',
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scroller: document?.querySelector('main'),
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return ctx;
  };

  useIsomorphicLayoutEffect(() => {
    const ctx = setupScrollAnimation();
    return () => ctx.kill();
  }, [isMobile]);

  const renderImageContainer = () => (
    <div className={styles.imageContainer}>
      <Image priority src="/giats/front.png" sizes="100%" fill alt="刘耀翔" />
    </div>
  );

  return (
    <section ref={rootRef} className={styles.root}>
      <div className={clsx(styles.nameContainer, 'layout-block-inner')}>
        <AppearTitle>
          <h1 className={clsx('h1', 'medium')}>你好，我是</h1>
          <h1 className={clsx('h1', 'medium')}>{site.name}</h1>
        </AppearTitle>
      </div>

      <div className={clsx(styles.container, 'layout-grid-inner')}>
        {isMobile ? renderImageContainer() : null}
        <div className={clsx(styles.descWrapper)} ref={animatedImageRef}>
          <AppearTitle>
            <div className="p-l">鲁迅美术学院染织艺术设计专业学生</div>
            <div className="p-l">点面科技创始人、DIANM视觉设计工作室队长</div>
            <div className="p-l">以设计为起点，探索 AIGC 与数字产品刘耀翔
              鲁迅美术学院染织服装艺术设计学院，23级染织艺术设计专业学生。
              沈阳市点面科技有限公司创始人、DIANM视觉设计工作室队长。
              擅长AIGC领域，获国际人工智能ITC认证，出品：LAFAI智能无限工作流、首个AIagent公众号智能体、Vibe coding产鲁迅美术学院美术博物馆小程序。
              2025-2026年，沈阳家博会中宠物家居系列展览主创人员之一，“花期”色彩家居系列展览团队成员；2025年酒店沐浴展中“沐国潮”沐浴文化展团队成员。
              2025年辽宁省“建行杯”创新创业大赛中《以宠为印 为爱铭记》项目获银奖；2024年辽宁省奥美冰球吉祥物征集获一等奖。</div>
          </AppearTitle>
        </div>
        {!isMobile ? renderImageContainer() : null}
        <div className={clsx(styles.descWrapperBottom)}>
          {!isMobile ? (
            <AppearTitle key="desktop-descWrapperBottom">
              <h6 className="h6">{site.intro}</h6>
            </AppearTitle>
          ) : (
            <AppearTitle key="mobile-descWrapperBottom">
              <h6 className="h6">{site.intro}</h6>
            </AppearTitle>
          )}
          <div className={clsx(styles.buttonContainer)}>
            <ButtonLink href="/about" label="查看详细介绍" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
