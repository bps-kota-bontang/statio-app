interface TabProps<T = string | number> {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  className?: string;
  badges?: Record<string | number, number>;
}

const Tab = <T extends string | number>({
  items,
  selected,
  onSelect,
  className = "",
  badges = {},
}: TabProps<T>) => (
  <div className={`flex gap-2 mb-4 ${className}`}>
    {items.map((item) => {
      const isSelected = selected === item;
      const count = badges[item] ?? 0;
      const badge =
        count > 0 ? (count >= 100 ? "99+" : count.toString()) : null;

      return (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`relative px-3 py-1 rounded-md text-sm font-medium transition-colors
            ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          {item}
          {badge && (
            <span
              className="absolute -top-1.75 -right-1.75 bg-red-500 text-white text-[10px] font-semibold rounded-full
                         flex items-center justify-center px-1 min-w-4 h-4 leading-none z-10"
            >
              {badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default Tab;
