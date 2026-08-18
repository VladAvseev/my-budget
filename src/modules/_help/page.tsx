import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import commonStyles from '@/shared/styles/common.module.css';
import { useNavigate } from 'react-router-dom';
import styles from './page.module.css';

interface SectionItem {
  type: 'paragraph';
  text: string;
}

interface Section {
  title: string;
  items: SectionItem[];
}

const SECTIONS: Section[] = [
  {
    title: 'Перед началом работы',
    items: [
      {
        type: 'paragraph',
        text: 'Для того чтобы баланс совпадал с суммой денег на счетах, в разделе «Профиль» задайте «Стартовый баланс» — начальную сумму, которая была на счетах до первой операции.',
      },
      {
        type: 'paragraph',
        text: 'Создайте подходящие под себя списки категорий в разделе "Профиль".',
      },
    ],
  },
  {
    title: 'Отчёты',
    items: [
      {
        type: 'paragraph',
        text: '«Отчёт» — это список ваших расходов, доходов и накоплений. Отчёт можно настраивать под себя и вести удобным для вас способом. Например, создавать отчёт для каждого месяца и записывать в него операции, совершённые в этом месяце (рекомендую).'
      },
      {
        type: 'paragraph',
        text: 'На странице каждого отчёта есть небольшая сводка информации по нему.'
      },
      {
        type: 'paragraph',
        text: '«Ежедневные расходы» (по желанию) — отдельная категория расходов, созданная для упрощения ведения бюджета. Вместо того, чтобы записывать каждую незначительную покупку, можно один раз в день вводить сумму таких расходов за день.',
      },
      {
        type: 'paragraph',
        text: 'В «Ежедневные расходы» рекомендуется записывать различные бытовые или незначительные расходы: продукты, проезд на метро или автобусе, бытовая химия и т. д.',
      },
      {
        type: 'paragraph',
        text: 'Более крупные или регулярные расходы рекомендуется записывать отдельно в список «Расходы» — аренда квартиры, коммунальные услуги, подписки на сервисы, интернет.',
      },
    ],
  },
  {
    title: 'Накопления',
    items: [
      {
        type: 'paragraph',
        text: 'В разделе «Накопления» можно отслеживать свои сбережения: вклады, инвестиции, отложенные суммы.',
      },
      {
        type: 'paragraph',
        text: 'Накопления бывают двух видов: добавленные вручную в разделе «Накопления» или появившиеся автоматически из отчётов, если в отчёте добавить операцию с типом «Накопление».',
      },
      {
        type: 'paragraph',
        text: 'Кольцо «Структура накоплений» показывает долю каждой категории в общем объёме сбережений, чтобы было видно, как распределены деньги.',
      },
    ],
  },
  {
    title: 'Обзор',
    items: [
      {
        type: 'paragraph',
        text: 'Раздел «Обзор» сводит доходы, расходы и накопления сразу за несколько отчётов в одной карточке.',
      },
      {
        type: 'paragraph',
        text: 'Сверху выберите отчёты, которые хотите учесть — сводка пересчитается автоматически.',
      },
      {
        type: 'paragraph',
        text: 'Ниже показан разбор расходов по категориям, чтобы видеть, на что уходят деньги.',
      },
    ],
  },
  {
    title: 'Баланс и капитал',
    items: [
      {
        type: 'paragraph',
        text: 'Баланс = стартовый баланс + все доходы − все расходы − накопления из отчётов − ежедневные расходы (по всем отчётам).',
      },
      {
        type: 'paragraph',
        text: 'Капитал = баланс + сумма всех накоплений.',
      },
    ],
  },
];

export const Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Помощь" onBack={() => navigate('/')} backAriaLabel="Назад на главную" />

      {SECTIONS.map((section) => (
        <VCard key={section.title} className={styles.card}>
          <div className={commonStyles.titleL}>{section.title}</div>
          <div className={styles.items}>
            {section.items.map((item, index) => (
              <div key={index} className={styles.item}>
                {item.text}
              </div>
            ))}
          </div>
        </VCard>
      ))}

      <VCard className={styles.supportCard}>
        <div className={commonStyles.titleL}>Не нашли ответ?</div>
        <div className={styles.supportText}>
          Задайте вопрос или сообщите об ошибке — администратор ответит вам в разделе «Поддержка».
        </div>
        <div>
          <VButton onClick={() => navigate('/support')}>Написать в поддержку</VButton>
        </div>
      </VCard>
    </div>
  );
};