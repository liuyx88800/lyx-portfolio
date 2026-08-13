/* eslint-disable react/jsx-props-no-spreading */
import CustomHead from '@src/components/dom/CustomHead';
import Link from 'next/link';
import clsx from 'clsx';
import site from '@src/constants/site';
import styles from '@src/pages/about/profile.module.scss';

const seo = {
  title: '关于刘耀翔｜视觉设计与 AIGC 创作者',
  description:
    '刘耀翔，鲁迅美术学院染织艺术设计专业学生，点面科技创始人、DIANM视觉设计工作室队长。',
  keywords: [
    '刘耀翔',
    '鲁迅美术学院',
    '染织艺术设计',
    'AIGC',
    '视觉设计师',
    '点面科技',
  ],
};

function Page() {
  return (
    <>
      <CustomHead {...seo} />
      <section className={clsx(styles.hero, 'layout-block-inner')}>
        <p className={styles.kicker}>个人介绍</p>
        <h1>{site.name}</h1>
        <div className={styles.identity}>
          <p>{site.title}</p>
          <p>{site.school}</p>
          <p>{site.major}</p>
        </div>
      </section>

      <section className={clsx(styles.statement, 'layout-grid-inner')}>
        <h2>{site.intro}</h2>
        <div className={styles.bio}>
          {site.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={clsx(styles.timeline, 'layout-block-inner')}>
        <header>
          <span>经历</span>
          <h2>展览与实践</h2>
        </header>
        <div className={styles.rows}>
          {site.experience.map((item) => (
            <article key={`${item.year}-${item.title}`}>
              <time>{item.year}</time>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={clsx(styles.timeline, 'layout-block-inner')}>
        <header>
          <span>荣誉</span>
          <h2>奖项与认可</h2>
        </header>
        <div className={styles.rows}>
          {site.awards.map((item) => (
            <article key={`${item.year}-${item.title}`}>
              <time>{item.year}</time>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={clsx(styles.contact, 'layout-block-inner')}>
        <p>如果你对我的作品、AIGC 实践或合作方向感兴趣</p>
        <h2>欢迎与我联系</h2>
        <Link href={`mailto:${site.email}`}>{site.email}</Link>
      </section>
    </>
  );
}

export default Page;
