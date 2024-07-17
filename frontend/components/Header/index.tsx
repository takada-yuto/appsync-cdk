import { RalewayFont, RampartOneFont } from '@/lib/font';

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-ivory-500 to-ivory-500 shadow-md mb-4 p-4">
      <h1 className={`text-3xl text-center ${RampartOneFont.className}`}>
        Todo App
      </h1>
    </header>
  );
};
