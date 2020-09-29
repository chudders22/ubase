using Microsoft.Owin.Security.Provider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Umbraco.Web;
using Umbraco.Web.Templates;

namespace Application.Core.Extensions
{
    public interface ILocalLinkConverter
    {
        HtmlString ParseHtmlString(string input);
    }
    public class LocalLinkConverter : ILocalLinkConverter
    {
        private readonly HtmlLocalLinkParser _localLinkParser;
        public LocalLinkConverter(HtmlLocalLinkParser localLinkParser)
        {
            _localLinkParser = localLinkParser;
        }
        public HtmlString ParseHtmlString(string input)
        {
            var ensured = _localLinkParser.EnsureInternalLinks(input);
            var parsed = new HtmlString(ensured);
            return parsed;
        }
    }
}
