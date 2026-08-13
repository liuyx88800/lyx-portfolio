/* eslint-disable react/jsx-props-no-spreading */
import CustomHead from '@src/components/dom/CustomHead';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import projects from '@src/constants/projects';
import series from '@src/constants/series';
import styles from '@src/pages/projects/gallery.module.scss';

const seo = {
  title: '刘耀翔｜全部作品',
  description: '刘耀翔的视觉设计、染织艺术、AIGC、展览与数字产品作品。',
  keywords: ['刘耀翔作品集', '视觉设计作品', 'AIGC作品', '染织艺术设计'],
};

function Page() {
  const router = useRouter();
  const activeSeries = router.query.series || 'all';

  const filteredProjects =
    activeSeries === 'all'
      ? projects
      : projects.filter((project) => project.series === activeSeries);

  return (
    <>
      <CustomHead {...seo} />
      <section className={clsx(styles.heading, 'layout-block-inner')}>
        <p>持续更新</p>
        <h1>全部作品</h1>
        <span>共 {filteredProjects.length} 件</span>
      </section>
      <section className={clsx(styles.filter, 'layout-block-inner')}>
        <Link
          scroll={false}
          href="/projects"
          className={clsx(
            styles.filterButton,
            activeSeries === 'all' && styles.filterButtonActive,
          )}
        >
          全部
        </Link>
        {series.map((item) => (
          <Link
            scroll={false}
            key={item.id}
            href={`/projects?series=${item.id}`}
            className={clsx(
              styles.filterButton,
              activeSeries === item.id && styles.filterButtonActive,
            )}
          >
            {item.name}
          </Link>
        ))}
      </section>
      <section className={clsx(styles.gallery, 'layout-block-inner')}>
        {filteredProjects.map((project, index) => (
          <Link
            aria-label={`查看作品：${project.title}`}
            key={project.id}
            scroll={false}
            href={project.link}
            className={styles.card}
          >
            <div className={styles.image}>
              <Image
                priority={index < 4}
                sizes="(max-width: 768px) 100vw, 50vw"
                src={project.img}
                fill
                alt={project.title}
              />
            </div>
            <div className={styles.meta}>
              <h2>{project.title}</h2>
              <time>{project.date}</time>
            </div>
            <p>{project.company}</p>
          </Link>
        ))}
      </section>
    </>
  );
}

export default Page;
