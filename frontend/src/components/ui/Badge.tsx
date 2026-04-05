interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'
  size?: 'sm' | 'md'
}

const colorMap = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({
  children,
  color = 'gray',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`
        ${colorMap[color]}
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        rounded-full font-semibold
      `}
    >
      {children}
    </span>
  )
}
