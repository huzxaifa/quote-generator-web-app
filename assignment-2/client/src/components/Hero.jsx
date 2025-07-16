import { logo } from "../assets";

const Hero = () => {
  return (
    <header className="w-full flex justify-center items-center flex-col">
      <nav className="flex justify-between items-center w-full mb-10 pt-3 px-8">
        {/*<img src={logo} alt="logo" className="w-28 object-contain" />*/}
        <div></div> {/* Placeholder to push content to the right */}
        <div className="flex items-center gap-4">
          <span className="orange_gradient font-satoshi font-medium text-sm">
            Huzaifa Khalid
          </span>
          <button
            type="button"
            onClick={() =>
              window.open("https://github.com/huzxaifa/Nexium_Internship")
            }
            className="github_btn"
          >
            GitHub
          </button>
        </div>
      </nav>

      <h1 className="orange_gradient head_text">
        Blog Summarizer <br className="max-md:hidden" />
        <br/>
      </h1>
      <h2 className="desc">
        Simplify your reading with Summize, an open-source article summarizer
        that transforms lengthy articles into clear and concise summaries
      </h2>
    </header>
  );
};

export default Hero;