import { useState, useEffect } from "react";
import axios from "axios";
import { useLazyGetSummaryQuery } from "../services/article";
import { copy, linkIcon, loader, tick } from "../assets";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
    translatedSummary: "",
    summaryError: "",
  });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [language, setLanguage] = useState("ur");
  const [isTranslating, setIsTranslating] = useState(false);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem(`articles`));
    if (articlesFromLocalStorage) {
      const uniqueArticles = Object.values(
        articlesFromLocalStorage.reduce((acc, article) => {
          acc[article.url] = article;
          return acc;
        }, {})
      );
      setAllArticles(uniqueArticles);
      localStorage.setItem(`articles`, JSON.stringify(uniqueArticles));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary, translatedSummary: "" };
      const isDuplicate = allArticles.some(
        (existingArticle) => existingArticle.url === article.url
      );
      let updatedAllArticles;
      if (isDuplicate) {
        updatedAllArticles = allArticles.map((existingArticle) =>
          existingArticle.url === article.url ? newArticle : existingArticle
        );
      } else {
        updatedAllArticles = [newArticle, ...allArticles];
      }
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem(`articles`, JSON.stringify(updatedAllArticles));
      try {
        await axios.post("http://localhost:3000/store-summary", {
          url: article.url,
          summary: data.summary,
        });
      } catch (error) {
        console.error("Failed to store summary:", error);
        setArticle({
          ...article,
          summaryError: error.response?.data || "Failed to store summary in Supabase",
        });
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
    <section className="mt-16 w-full max-w-4xl">
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
            <div key={`link-${index}`} className="link_card">
              <div className="copy_btn" onClick={() => handleCopy(article.url)}>
                <img
                  src={copied === article.url ? tick : copy}
                  alt="copy_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p
                className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate"
                onClick={() =>
                  setArticle({ ...article, translatedSummary: "", summaryError: "" })
                }
              >
                {article.url}
              </p>
              <button
                className="font-satoshi text-red-600 text-sm"
                onClick={() => {
                  const updatedArticles = allArticles.filter(
                    (_, i) => i !== index
                  );
                  setAllArticles(updatedArticles);
                  localStorage.setItem('articles', JSON.stringify(updatedArticles));
                }}
              >
                Delete
              </button>
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
            <div className="flex flex-col gap-3 w-full">
              {article.summaryError && (
                <p className="font-inter text-sm text-red-600">
                  {article.summaryError}
                </p>
              )}
              <div className="flex flex-row gap-4 w-full">
                <div className="summary_box flex-1">
                  <h3 className="font-satoshi font-semibold text-gray-600 text-base">
                    Article Summary
                  </h3>
                  <p className="font-inter font-medium text-sm text-gray-700">
                    {article.summary}
                  </p>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <div className="summary_box">
                    <h3 className="font-satoshi font-semibold text-gray-600 text-base">
                      Article Translation ({language.toUpperCase()})
                    </h3>
                    {article.translatedSummary ? (
                      <p className="font-inter font-medium text-sm text-gray-700">
                        {article.translatedSummary.includes('Translation failed')
                          ? `Error: ${article.translatedSummary}`
                          : article.translatedSummary}
                      </p>
                    ) : (
                      <p className="font-inter font-medium text-sm text-gray-500">
                        No translation yet
                      </p>
                    )}
                  </div>
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
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;