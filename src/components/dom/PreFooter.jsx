import FruitNinja from '@src/components/dom/prefooter/Index';
import clsx from 'clsx';
import styles from '@src/components/dom/styles/preFooter.module.scss';

function PreFooter() {
  return (
    <section className={clsx(styles.root, 'layout-block-inner')}>
      <div className={styles.textsContainer}>
        <div>
          <h2 className="h1">让创意发生</h2>
          <h2 className="h1">也让想象</h2>
          <h2 className="h1">真正落地</h2>
        </div>
        <div>
          <h6 className="h6">欢迎交流视觉设计、AIGC 与数字体验项目。</h6>
        </div>
      </div>

      <div className={styles.canvas}>
        <FruitNinja />
      </div>
    </section>
  );
}

export default PreFooter;
