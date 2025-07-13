import { useState, useEffect } from "react";
import axios from "axios";
import { useLazyGetSummaryQuery } from "../services/article";
import { copy, linkIcon, loader, tick } from "../assets";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
    translatedSummary: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [language, setLanguage] = useState("ur");
  const [isTranslating, setIsTranslating] = useState(false);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem(`articles`));
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary, translatedSummary: "" };
      const updatedAllArticles = [newArticle, ...allArticles];
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem(`articles`, JSON.stringify(updatedAllArticles));
      // Store summary in Supabase
      try {
        await axios.post("http://localhost:3000/store-summary", {
          url: article.url,
          summary: data.summary,
        });
      } catch (error) {
        console.error("Failed to store summary:", error);
      }
    }
  };

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTranslate = async () => {
    if (!article.summary) return;
    setIsTranslating(true);
    try {
      const response = await axios.post("http://localhost:3000/translate", {
        text: article.summary,
        url: article.url,
        source: "en",
        target: language,
      });
      const newArticle = {
        ...article,
        translatedSummary: response.data || "No translation available",
        translatedLanguage: language,
      };
      const updatedAllArticles = [
        newArticle,
        ...allArticles.filter((_, i) => i !== 0),
      ];
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem(`articles`, JSON.stringify(updatedAllArticles));
      setIsTranslating(false);
    } catch (error) {
      console.error("Translation error:", error);
      setIsTranslating(false);
      setArticle({
        ...article,
        translatedSummary: error.response?.data || "Translation failed",
      });
    }
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            ↵
          </button>
        </form>

        {/* Browse URL History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.map((article, index) => (
            <div
              key={`link-${index}`}
              onClick={() =>
                setArticle({ ...article, translatedSummary: "" })
              }
              className="link_card"
            >
              <div className="copy_btn" onClick={() => handleCopy(article.url)}>
                <img
                  src={copied === article.url ? tick : copy}
                  alt="copy_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                {article.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Display Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                Article <span className="blue_gradient">Summary</span>
              </h2>
              <div className="summary_box">
                <p className="font-inter font-medium text-sm text-gray-700">
                  {article.summary}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                  Translated <span className="blue_gradient">Summary</span>
                </h2>
                <div className="flex gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded bg-blue-100 py-1 px-2 text-sm text-cyan-600"
                    disabled={isTranslating || !article.summary}
                  >
                    <option value="ur">Urdu</option>
                    <option value="fr">French</option>
                    <option value="ru">Russian</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                  </select>
                  <button
                    onClick={handleTranslate}
                    className="rounded bg-cyan-700 py-2 px-4 text-white"
                    disabled={isTranslating || !article.summary}
                  >
                    {isTranslating ? "Translating..." : "Translate"}
                  </button>
                </div>
                {article.translatedSummary && (
                  <div className="summary_box">
                    <p className="font-inter font-medium text-sm text-gray-700">
                      {article.translatedSummary.includes('Translation failed')
                        ? `Error: ${article.translatedSummary}`
                        : article.translatedSummary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;