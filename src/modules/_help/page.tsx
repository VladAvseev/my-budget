import { VButton } from '@/shared/ui/VButton';
import { VCard } from '@/shared/ui/VCard';
import { VPageHeader } from '@/shared/ui/VPageHeader';
import commonStyles from '@/shared/styles/common.module.css';
import {
  BanknotesIcon,
  HelpIcon,
  OverviewIcon,
  ReportsIcon,
  SavingsIcon,
} from '@/shared/icons';
import type { IconProps } from '@/shared/icons/types';
import type { ComponentType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './page.module.css';

interface TextSegment {
  text: string;
  bold?: boolean;
  to?: string;
}

interface SectionItem {
  type: 'paragraph';
  segments: TextSegment[];
}

interface Section {
  icon: ComponentType<IconProps>;
  title: string;
  items: SectionItem[];
}

const SECTIONS: Section[] = [
  {
    icon: HelpIcon,
    title: 'Перед началом работы',
    items: [
      {
        type: 'paragraph',
        segments: [
          {
            text: 'Для того чтобы баланс совпадал с суммой денег на счетах, в разделе ',
          },
          { text: '«Профиль»', to: '/profile', bold: true },
          { text: ' задайте ' },
          { text: '«Стартовый баланс»', bold: true },
          {
            text: ' — начальную сумму, которая была на счетах до первой операции.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'Создайте подходящие под себя списки категорий в разделе ' },
          { text: '«Профиль»', to: '/profile', bold: true },
          { text: '.' },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'В ' },
          { text: '«Профиле»', to: '/profile', bold: true },
          { text: ' также можно выбрать ' },
          { text: 'валюту', bold: true },
          {
            text: ' — рубль, доллар, евро и другие. Символ валюты будет отображаться рядом со всеми суммами в приложении.',
          },
        ],
      },
    ],
  },
  {
    icon: ReportsIcon,
    title: 'Отчёты',
    items: [
      {
        type: 'paragraph',
        segments: [
          { text: '«Отчёт»', bold: true },
          {
            text: ' — это список ваших расходов, доходов и накоплений. Отчёт можно настраивать под себя и вести удобным для вас способом. Например, создавать отчёт для каждого месяца и записывать в него операции, совершённые в этом месяце (рекомендую).',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'На странице каждого отчёта есть небольшая сводка информации по нему.' },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«Ежедневные расходы»', bold: true },
          {
            text: ' (по желанию) — отдельная категория расходов, созданная для упрощения ведения бюджета. Вместо того, чтобы записывать каждую незначительную покупку, можно один раз в день вводить сумму таких расходов за день.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'В ' },
          { text: '«Ежедневные расходы»', bold: true },
          {
            text: ' рекомендуется записывать различные бытовые или незначительные расходы: продукты, проезд на метро или автобусе, бытовая химия и т. д.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          {
            text: 'Более крупные или регулярные расходы рекомендуется записывать отдельно в список ',
          },
          { text: '«Расходы»', bold: true },
          {
            text: ' — аренда квартиры, коммунальные услуги, подписки на сервисы, интернет.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          {
            text: 'В отчётах есть пять типов операций. Каждый по-своему влияет на баланс и капитал:',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«Доходы»', bold: true },
          { text: ' — увеличивают баланс и капитал.' },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«Расходы»', bold: true },
          { text: ' — уменьшают баланс и капитал.' },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«Пополнение накоплений»', bold: true },
          {
            text: ' — уменьшают баланс (деньги уходят из оборота), но не влияют на капитал, так как добавляются в накопления.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«Вывод средств»', bold: true },
          {
            text: ' — увеличивают баланс (деньги возвращаются в оборот), но не влияют на капитал, так как списываются из накоплений.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«Ежедневные расходы»', bold: true },
          {
            text: ' — работают как обычные расходы, но записываются по дням. Подробнее — в разделе ниже.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'Остаток внутри отчёта считается по формуле: ' },
          {
            text: 'доходы − расходы − ежедневные расходы − пополнения накоплений + вывод средств',
            bold: true,
          },
          {
            text: '. Пополнение накоплений уменьшает остаток, потому что деньги «уходят» из оборота. Вывод средств увеличивает остаток, потому что деньги «возвращаются» в оборот.',
          },
        ],
      },
    ],
  },
  {
    icon: SavingsIcon,
    title: 'Накопления',
    items: [
      {
        type: 'paragraph',
        segments: [
          { text: 'В разделе ' },
          { text: '«Накопления»', to: '/accumulations', bold: true },
          {
            text: ' можно отслеживать свои сбережения: вклады, инвестиции, отложенные суммы.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          {
            text: 'Ручные накопления — это способ добавить в приложение сбережения, которые уже были до начала ведения учёта: вклады, наличные, инвестиции и т. д.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'Накопления бывают двух видов: добавленные вручную в разделе ' },
          { text: '«Накопления»', to: '/accumulations', bold: true },
          {
            text: ' или появившиеся автоматически из отчётов, если в отчёте добавить операцию с типом ',
          },
          { text: '«Накопление»', bold: true },
          { text: '.' },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: '«График капитала»', bold: true },
          {
            text: ' показывает динамику вашего капитала (баланс + все накопления) по месяцам. ' },
          { text: '«График накоплений»', bold: true },
          {
            text: ' — только суммы сбережений. Графики можно переключать и просматривать за всё время или за последний год.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'Кольцо ' },
          { text: '«Структура накоплений»', bold: true },
          {
            text: ' показывает долю каждой категории — как ручных накоплений, так и накоплений из отчётов — в общем объёме сбережений.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'Цели накоплений', bold: true },
          {
            text: ' — желаемые суммы для категорий сбережений. Установить цель (одну на категорию) можно в разделе ',
          },
          { text: '«Накопления»', to: '/accumulations', bold: true },
          { text: ' в блоке «Цели накоплений».' },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          {
            text: 'В прогресс цели входят все накопления её категории: добавленные вручную и появившиеся из отчётов, а снятия уменьшают результат. Прогресс виден в списке целей и в карточке накоплений на главной странице.',
          },
        ],
      },
    ],
  },
  {
    icon: OverviewIcon,
    title: 'Обзор',
    items: [
      {
        type: 'paragraph',
        segments: [
          { text: 'Раздел ' },
          { text: '«Обзор»', to: '/overview', bold: true },
          {
            text: ' сводит доходы, расходы и накопления сразу за несколько отчётов в одной карточке.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          {
            text: 'Сверху выберите отчёты, которые хотите учесть — сводка пересчитается автоматически.',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          {
            text: 'Ниже показан разбор расходов по категориям, чтобы видеть, на что уходят деньги.',
          },
        ],
      },
    ],
  },
  {
    icon: BanknotesIcon,
    title: 'Баланс и капитал',
    items: [
      {
        type: 'paragraph',
        segments: [
          { text: 'Баланс', bold: true },
          {
            text: ' = стартовый баланс + все доходы − все расходы − накопления из отчётов − ежедневные расходы (по всем отчётам).',
          },
        ],
      },
      {
        type: 'paragraph',
        segments: [
          { text: 'Капитал', bold: true },
          { text: ' = баланс + сумма всех накоплений.' },
        ],
      },
    ],
  },
];

export const Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={commonStyles.page}>
      <VPageHeader title="Помощь" onBack={() => navigate('/')} backAriaLabel="Назад на главную" />

      {SECTIONS.map((section, sectionIndex) => (
        <div
          key={section.title}
          className={commonStyles.animateCard}
          style={{ animationDelay: `${sectionIndex * 0.03}s` }}
        >
          <VCard className={styles.card}>
            <div className={styles.titleRow}>
              <span className={styles.titleIcon}>
                <section.icon size={18} />
              </span>
              <div className={commonStyles.titleL}>{section.title}</div>
            </div>
            <div className={styles.items}>
              {section.items.map((item, index) => (
                <div key={index} className={styles.item}>
                  {item.segments.map((segment, segIndex) => {
                    if (segment.to) {
                      return (
                        <Link
                          key={segIndex}
                          to={segment.to}
                          className={`${styles.link}${segment.bold ? ` ${styles.strong}` : ''}`}
                        >
                          {segment.text}
                        </Link>
                      );
                    }
                    return segment.bold ? (
                      <strong key={segIndex} className={styles.strong}>
                        {segment.text}
                      </strong>
                    ) : (
                      <span key={segIndex}>{segment.text}</span>
                    );
                  })}
                </div>
              ))}
            </div>
          </VCard>
        </div>
      ))}

      <div className={commonStyles.animateCard} style={{ animationDelay: '0.15s' }}>
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
    </div>
  );
};