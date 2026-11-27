interface LogoProps {
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function Logo({ onClick, size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 20 : 22;
  const textClass = size === 'sm' ? 'text-base' : 'text-[17px]';

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5145CD]/40 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2.5"
          y="2.5"
          width="19"
          height="19"
          rx="5"
          stroke="#5145CD"
          strokeWidth="2"
        />
        <path
          d="M13.5 13.5L17.5 17.5"
          stroke="#5145CD"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="11.25" cy="11.25" r="3.5" stroke="#171717" strokeWidth="1.75" />
      </svg>
      <span className={`font-display font-semibold tracking-tight text-[#171717] ${textClass}`}>
        Quizora
      </span>
    </button>
  );
}
