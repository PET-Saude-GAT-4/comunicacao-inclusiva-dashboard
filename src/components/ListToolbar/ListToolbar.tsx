type Props = {
  start?: React.ReactNode;
  search: React.ReactNode;
  end?: React.ReactNode;
};

// The bar above a list: tabs or an action on the left, the search in the
// middle, add and remove on the right. The two sides grow from the same zero
// basis, so they stay equal and the search sits in the middle whatever is
// beside it; with justify-between it drifted with the width of the sides, and
// moved when a tab's label did. When the bar runs short, the search shrinks
// rather than the sides wrapping.
export default function ListToolbar({ start, search, end }: Props) {
  return (
    <div className="flex items-center gap-lg rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
      <div className="flex min-w-max flex-1 basis-0 items-center justify-start">
        {start}
      </div>
      <div className="w-100 min-w-0">{search}</div>
      <div className="flex min-w-max flex-1 basis-0 items-center justify-end">
        {end}
      </div>
    </div>
  );
}
