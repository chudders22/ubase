using Perplex.ContentBlocks.Definitions;
using Perplex.ContentBlocks.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Extensions
{  
    public interface IPerplexHeaderGetter
    {
        IEnumerable<IContentBlockViewModel> GetHeaders(IContentBlocks blocks, string documentType);
    }
    public class PerplexHeaderGetter : IPerplexHeaderGetter
    {
        public IEnumerable<IContentBlockViewModel> GetHeaders(IContentBlocks blocks, string documentType)
        {
            var filtered = blocks.Blocks.Where(x => x.Content.ContentType.Alias == "blockHeading");
            return filtered;
        }
    }
    
}
