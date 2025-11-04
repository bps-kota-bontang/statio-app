interface TabProps<T = string | number> {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  className?: string;
  itemClassName?: string;
}

const Tab = <T extends string | number>({
  items,
  selected,
  onSelect,
  className = "",
  itemClassName = "",
}: TabProps<T>) => {
  return (
    <div className={`flex gap-2 mb-4 ${className}`}>
      {items.map((item) => (
        <button
          key={item}
          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
            selected === item
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } ${itemClassName}`}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default Tab;
