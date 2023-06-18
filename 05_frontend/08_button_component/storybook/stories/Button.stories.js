import { Button } from './Button';

export default {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
};

export const Default = {}

export const Apply = {
  args: {
    children: '応募する',
    color: 'blue',
    size: 'medium',
    disabled: false,
    onClick: () => alert('応募します'),
  },
};

export const Delete = {
  args: {
    children: '削除する',
    color: 'red',
    size: 'small',
    disabled: false,
    onClick: () => alert('削除します'),
  },
};

export const Disabled = {
  args: {
    children: '削除する',
    color: 'red',
    size: 'small',
    disabled: true,
  },
};
