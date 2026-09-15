import { defineComponent, h } from 'vue'
import { cn } from '@/utils/cn'

export const Table = defineComponent({
  name: 'UiTable',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'div',
        { class: 'relative w-full overflow-visible', 'data-slot': 'table-container' },
        [
          h(
            'table',
            {
              ...attrs,
              class: cn('w-full caption-bottom text-sm', attrs.class as string | undefined),
              'data-slot': 'table',
            },
            slots.default?.(),
          ),
        ],
      )
  },
})

export const TableHeader = defineComponent({
  name: 'UiTableHeader',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'thead',
        {
          ...attrs,
          class: cn(attrs.class as string | undefined),
          'data-slot': 'table-header',
        },
        slots.default?.(),
      )
  },
})

export const TableBody = defineComponent({
  name: 'UiTableBody',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'tbody',
        {
          ...attrs,
          class: cn('[&_tr:last-child]:border-0', attrs.class as string | undefined),
          'data-slot': 'table-body',
        },
        slots.default?.(),
      )
  },
})

export const TableFooter = defineComponent({
  name: 'UiTableFooter',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'tfoot',
        {
          ...attrs,
          class: cn(
            'border-t border-fikr-hairline bg-fikr-parchment/80 font-medium [&>tr]:last:border-b-0',
            attrs.class as string | undefined,
          ),
          'data-slot': 'table-footer',
        },
        slots.default?.(),
      )
  },
})

export const TableRow = defineComponent({
  name: 'UiTableRow',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'tr',
        {
          ...attrs,
          class: cn(
            'border-b border-fikr-hairline transition-colors hover:bg-primary-50/60 data-[state=selected]:bg-primary-50',
            attrs.class as string | undefined,
          ),
          'data-slot': 'table-row',
        },
        slots.default?.(),
      )
  },
})

export const TableHead = defineComponent({
  name: 'UiTableHead',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'th',
        {
          ...attrs,
          class: cn(
            'h-12 px-3 text-start align-middle font-medium text-gray-500 [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pe-0',
            attrs.class as string | undefined,
          ),
          'data-slot': 'table-head',
        },
        slots.default?.(),
      )
  },
})

export const TableCell = defineComponent({
  name: 'UiTableCell',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'td',
        {
          ...attrs,
          class: cn(
            'p-3 align-middle [&:has([role=checkbox])]:pe-0',
            attrs.class as string | undefined,
          ),
          'data-slot': 'table-cell',
        },
        slots.default?.(),
      )
  },
})

export const TableCaption = defineComponent({
  name: 'UiTableCaption',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'caption',
        {
          ...attrs,
          class: cn('mt-4 text-sm text-gray-500', attrs.class as string | undefined),
          'data-slot': 'table-caption',
        },
        slots.default?.(),
      )
  },
})

export default Table
