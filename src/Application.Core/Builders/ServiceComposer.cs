using Application.Core.Extensions;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Application.Core.Builders
{
    public class RegisterHtmlExtensionComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            // if your service makes use of the current UmbracoContext, eg AssignedContentItem - register the service in Request scope
            // composition.Register<ISiteService, SiteService>(Lifetime.Request);
            // if not then it is better to register in 'Singleton' Scope
            composition.Register<ILocalLinkConverter, LocalLinkConverter>(Lifetime.Singleton);
        }
    }
    public class RegisterPerplexContentBlockExtensionsComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            // if your service makes use of the current UmbracoContext, eg AssignedContentItem - register the service in Request scope
            // composition.Register<ISiteService, SiteService>(Lifetime.Request);
            // if not then it is better to register in 'Singleton' Scope
            composition.Register<IPerplexHeaderGetter, PerplexHeaderGetter>(Lifetime.Singleton);
        }
    }
}
