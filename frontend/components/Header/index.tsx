import { Rampart_One, Raleway } from 'next/font/google';

const RampartOneFont = Rampart_One({
  weight: '400',
  subsets: ['latin'],
});
const RalewayFont = Raleway({
  weight: '400',
  subsets: ['latin'],
});

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-ivory-500 to-ivory-500 shadow-md mb-4 p-4">
      <h1 className={`text-3xl text-center ${RampartOneFont.className}`}>
        Todo App
      </h1>
      <h2 className={`text-xl text-center ${RalewayFont.className}`}>
        Hello World
      </h2>
    </header>
  );
};
