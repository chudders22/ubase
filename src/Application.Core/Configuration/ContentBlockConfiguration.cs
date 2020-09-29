using Perplex.ContentBlocks.Categories;
using Perplex.ContentBlocks.Definitions;
using static Perplex.ContentBlocks.Constants.PropertyEditor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Composing;

namespace Torbay.Documents
{
    class ContentBlocksConfiguration : IComponent
    {
        private readonly IContentBlockDefinitionRepository _definitions;
        private readonly IContentBlockCategoryRepository _categories;
        public ContentBlocksConfiguration(IContentBlockDefinitionRepository definitions, IContentBlockCategoryRepository categories)
        {
            _definitions = definitions;
            _categories = categories;
        }
        public void Initialize()
        {
            var MediaCategory = new ContentBlockCategory
            {
                Name = "Media",
                Id = new Guid("10000000-0000-0000-0000-000000000000"),
                Icon = $"{AssetsFolder}/icons.svg#icon-cat-media",
                IsEnabledForHeaders = false,
                IsDisabledForBlocks = false,
            };
            _categories.Add(MediaCategory);
            var ChartsCategory = new ContentBlockCategory
            {
                Name = "Charts",
                Id = new Guid("20000000-0000-0000-0000-000000000000"),
                Icon = $"{AssetsFolder}/icons.svg#icon-cat-charts",
                IsEnabledForHeaders = false,
                IsDisabledForBlocks = false,
            };
            _categories.Add(ChartsCategory);

            var HeadingBlock = new ContentBlockDefinition
            {
                Name = "Heading",
                Id = new Guid("00000000-0000-0000-0000-000000000010"),
                DataTypeKey = new Guid("a4b08b27-8336-4828-9873-0d25fa38ce53"),
                PreviewImage = $"{AssetsFolder}/previews/content/heading/default.svg",
                Description = "Use this for adding a heading to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000011"),
                        Name = "Default",
                        Description = "The default heading layout",
                        PreviewImage = "/img/heading/default.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Heading/Default.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(HeadingBlock);

            var TextBlock = new ContentBlockDefinition
            {
                Name = "Text",
                Id = new Guid("00000000-0000-0000-0000-000000000020"),
                DataTypeKey = new Guid("d215ea0a-c083-46a4-9579-89f286c966be"),
                PreviewImage = $"{AssetsFolder}/previews/content/text/default.svg",
                Description = "Use this for adding a block of text to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000021"),
                        Name = "Default",
                        Description = "The default text layout",
                        PreviewImage = $"{AssetsFolder}/previews/content/text/default.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Text/Default.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000022"),
                        Name = "Highlighted",
                        Description = "Layout that visually distinguishes the text from the rest of the content",
                        PreviewImage = $"{AssetsFolder}/previews/content/text/highlighted.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Text/Highlighted.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(TextBlock);
            var ListBlock = new ContentBlockDefinition
            {
                Name = "List",
                Id = new Guid("00000000-0000-0000-0000-000000000030"),
                DataTypeKey = new Guid("ea52828c-9525-4646-bd4b-b1a62be280cd"),
                PreviewImage = $"{AssetsFolder}/previews/content/list/default.svg",
                Description = "Use this for adding a list to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000031"),
                        Name = "Default",
                        Description = "The default list layout",
                        PreviewImage =  $"{AssetsFolder}/previews/content/list/default.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/List/Default.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000032"),
                        Name = "Positive",
                        Description = "Layout which visually denotes each list item as being a positive or must have",
                        PreviewImage =  $"{AssetsFolder}/previews/content/list/positive.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/List/Positive.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000033"),
                        Name = "Negative",
                        Description = "Layout which visually denotes each list item as being a negative or must not have",
                        PreviewImage =  $"{AssetsFolder}/previews/content/list/negative.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/List/Negative.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000034"),
                        Name = "Alpha",
                        Description = "Layout which uses a, b, c etc. as the list pointers as opposed to the default",
                        PreviewImage =  $"{AssetsFolder}/previews/content/list/alpha.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/List/Alpha.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000035"),
                        Name = "Numeric",
                        Description = "Layout which uses 1, 2, 3 etc. as the list pointers as opposed to the default",
                        PreviewImage =  $"{AssetsFolder}/previews/content/list/numeric.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/List/Numeric.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(ListBlock);

            var TableBlock = new ContentBlockDefinition
            {
                Name = "Table",
                Id = new Guid("00000000-0000-0000-0000-000000000040"),
                DataTypeKey = new Guid("41b6c15b-2a48-48da-bba5-03b2a6ff3900"),
                PreviewImage = $"{AssetsFolder}/previews/content/table/default.svg",
                Description = "Use this for adding a table to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000041"),
                        Name = "Default",
                        Description = "The default table layout",
                        PreviewImage = "/img/textblock.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Table/Default.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(TableBlock);
            var AlertBlock = new ContentBlockDefinition
            {
                Name = "Alert",
                Id = new Guid("00000000-0000-0000-0000-000000000050"),
                DataTypeKey = new Guid("0164aa45-9dc0-4aaa-be21-d02e0c640315"),
                PreviewImage = $"{AssetsFolder}/previews/content/alert/default.svg",
                Description = "Use this for adding an alert to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000051"),
                        Name = "Default",
                        Description = "The default alert layout",
                        PreviewImage = $"{AssetsFolder}/previews/content/alert/default.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Alert/Default.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000052"),
                        Name = "Success",
                        Description = "Layout for a positive or successful alert",
                        PreviewImage = $"{AssetsFolder}/previews/content/alert/positive.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Alert/Positive.cshtml"
                    },
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000053"),
                        Name = "Negative",
                        Description = "Layout for a negative or unsuccessful alert",
                        PreviewImage = $"{AssetsFolder}/previews/content/alert/negative.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Alert/Negative.cshtml"
                    }
                },
                CategoryIds = new[]
                            {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(AlertBlock);
            
            var QuoteBlock = new ContentBlockDefinition
            {
                Name = "Quote",
                Id = new Guid("00000000-0000-0000-0000-000000000060"),
                DataTypeKey = new Guid("2460f4af-26e2-4133-bfda-f586b3009aae"),
                PreviewImage = $"{AssetsFolder}/previews/content/quote/default.svg",
                Description = "Use this for adding a quote to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000061"),
                        Name = "Default",
                        Description = "The default quote layout",
                        PreviewImage = $"{AssetsFolder}/previews/content/quote/default.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Quote/Default.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(QuoteBlock);

            var StatisticBlock = new ContentBlockDefinition
            {
                Name = "Statistic",
                Id = new Guid("00000000-0000-0000-0000-000000000070"),
                DataTypeKey = new Guid("cdaac30e-b726-4c29-b3cc-c6c77ce44c79"),
                PreviewImage = $"{AssetsFolder}/previews/content/statistic/default.svg",
                Description = "Use this for adding a statistic to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-000000000071"),
                        Name = "Default",
                        Description = "The default quote layout",
                        PreviewImage = $"{AssetsFolder}/previews/content/statistic/default.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks/Content/Statistic/Default.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    Perplex.ContentBlocks.Constants.Categories.Content
                },
            };
            _definitions.Add(StatisticBlock);

            var SingleImage = new ContentBlockDefinition
            {
                Name = "Single image",
                Id = new Guid("00000000-0000-0000-0000-100000000010"),
                DataTypeKey = new Guid("ac92d846-16ae-47a0-8221-292b911c6ad4"),
                PreviewImage = $"{AssetsFolder}/previews/media/singleimage/default.svg",
                Description = "Use this for adding a single image to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-100000000011"),
                        Name = "Default",
                        Description = "The default single image layout",
                        PreviewImage = "/img/singleimage.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks//Media/SingleImage/Default.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    MediaCategory.Id
                },
            };
            _definitions.Add(SingleImage);
            
            var MultipleImages = new ContentBlockDefinition
            {
                Name = "Multiple images",
                Id = new Guid("00000000-0000-0000-0000-100000000020"),
                DataTypeKey = new Guid("328243ee-3096-44a0-8996-6531b19385ef"),
                PreviewImage = $"{AssetsFolder}/previews/media/singleimage/default.svg",
                Description = "Use this for adding a single image to a page",
                Layouts = new IContentBlockLayout[]
                {
                    new ContentBlockLayout
                    {
                        Id = new Guid("00000000-0000-0000-0000-100000000021"),
                        Name = "Default",
                        Description = "The default single image layout",
                        PreviewImage = "/img/singleimage.svg",
                        ViewPath = "~/Views/Partials/ContentBlocks//Media/SingleImage/Default.cshtml"
                    }
                },
                CategoryIds = new[]
                {
                    MediaCategory.Id
                },
            };
            _definitions.Add(MultipleImages);
        }
        public void Terminate() { }
        [RuntimeLevel(MinLevel = Umbraco.Core.RuntimeLevel.Run)]
        public class ContentBlockConfigurationComposer : ComponentComposer<ContentBlocksConfiguration> { }
    }
}
