import 'server-only'

import type { TestCategoryId } from './catalog'

export interface AssessmentQuestion {
  id: string
  text: string
  options: [string, string, string, string]
  correct: number
  explanation: string
}

export const TEST_QUESTION_BANK: Record<TestCategoryId, AssessmentQuestion[]> = {
  technology: [
    {
      id: 'technology-01',
      text: 'What is the average time complexity of searching for a key in a well-balanced binary search tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 1,
      explanation: 'A balanced tree has logarithmic height, so search visits at most one node per level.',
    },
    {
      id: 'technology-02',
      text: 'Which data structure is most appropriate for implementing a FIFO work queue?',
      options: ['Stack', 'Queue', 'Binary search tree', 'Hash set'],
      correct: 1,
      explanation: 'A queue removes items in the same order they were added: first in, first out.',
    },
    {
      id: 'technology-03',
      text: 'Which database index is generally most useful for an equality lookup on a selective column?',
      options: ['B-tree index', 'Full table scan', 'Heap sort index', 'Foreign key constraint only'],
      correct: 0,
      explanation: 'A B-tree index can locate matching values without scanning every row.',
    },
    {
      id: 'technology-04',
      text: 'In HTTP, which method is intended to be safe and idempotent when retrieving a resource?',
      options: ['POST', 'PATCH', 'GET', 'CONNECT'],
      correct: 2,
      explanation: 'GET retrieves a representation and is specified as a safe, idempotent method.',
    },
    {
      id: 'technology-05',
      text: 'What does a database transaction property of atomicity guarantee?',
      options: ['All transaction operations happen or none do', 'Rows are always stored in alphabetical order', 'Every query uses an index', 'The database is available without a network'],
      correct: 0,
      explanation: 'Atomicity makes a transaction indivisible: partial changes are rolled back.',
    },
    {
      id: 'technology-06',
      text: 'What is the primary purpose of a content delivery network (CDN)?',
      options: ['Compile source code in the browser', 'Serve content from locations closer to users', 'Replace an application database', 'Encrypt every database column'],
      correct: 1,
      explanation: 'A CDN caches and serves content near users to reduce latency and origin load.',
    },
    {
      id: 'technology-07',
      text: 'Which statement best describes a race condition?',
      options: ['A program finishes before its timeout', 'The result depends on the timing of concurrent operations', 'A database sorts rows differently', 'A network packet takes an alternate route'],
      correct: 1,
      explanation: 'A race occurs when concurrent operations access shared state and timing changes the outcome.',
    },
    {
      id: 'technology-08',
      text: 'What does a foreign key primarily enforce in a relational database?',
      options: ['Referential integrity between related tables', 'Unique values across every table', 'Automatic encryption at rest', 'A fixed order for query results'],
      correct: 0,
      explanation: 'A foreign key constrains references to valid rows in the related table.',
    },
    {
      id: 'technology-09',
      text: 'Which approach helps prevent cross-site scripting when rendering user-provided text?',
      options: ['Render the text as raw HTML', 'Escape output for its rendering context', 'Store the text in a larger database column', 'Disable browser caching'],
      correct: 1,
      explanation: 'Context-aware output encoding prevents user text from being interpreted as executable markup.',
    },
    {
      id: 'technology-10',
      text: 'In Git, what does a merge commit represent?',
      options: ['A commit combining histories from two branches', 'A deleted remote repository', 'A commit with no parent', 'A package lockfile update'],
      correct: 0,
      explanation: 'A merge commit joins the histories of the branches being integrated.',
    },
  ],
  finance: [
    {
      id: 'finance-01',
      text: 'A company has current assets of $180,000 and current liabilities of $120,000. What is its current ratio?',
      options: ['0.67', '1.0', '1.5', '2.5'],
      correct: 2,
      explanation: 'Current ratio equals current assets divided by current liabilities: 180,000 / 120,000 = 1.5.',
    },
    {
      id: 'finance-02',
      text: 'Under the indirect cash flow method, an increase in accounts receivable is generally:',
      options: ['Added to net income', 'Subtracted from net income', 'Reported as financing cash flow', 'Ignored because it is non-current'],
      correct: 1,
      explanation: 'Revenue recognized but not yet collected increases receivables and reduces operating cash relative to net income.',
    },
    {
      id: 'finance-03',
      text: 'If a bond trades below its face value, its yield to maturity is generally:',
      options: ['Below its coupon rate', 'Equal to its coupon rate', 'Above its coupon rate', 'Always zero'],
      correct: 2,
      explanation: 'A discount bond converges to face value at maturity, raising its yield above the coupon rate.',
    },
    {
      id: 'finance-04',
      text: 'What is the present value of $110 received one year from now at a 10% annual discount rate?',
      options: ['$90', '$100', '$110', '$121'],
      correct: 1,
      explanation: 'Present value is 110 / 1.10 = $100.',
    },
    {
      id: 'finance-05',
      text: 'What does diversification primarily reduce in a portfolio?',
      options: ['All market risk', 'Company-specific risk', 'The risk-free rate', 'Inflation by definition'],
      correct: 1,
      explanation: 'Holding less-correlated assets can reduce idiosyncratic risk, but not broad market risk.',
    },
    {
      id: 'finance-06',
      text: 'A project costs $100 today and has a net present value of $12 at the required return. What does this imply?',
      options: ['Expected value creation of $12 above the required return', 'Guaranteed cash proceeds of $12 next year', 'The project has no risk', 'The initial cost is recovered immediately'],
      correct: 0,
      explanation: 'Positive NPV means discounted expected cash inflows exceed the investment by $12.',
    },
    {
      id: 'finance-07',
      text: 'If a firm issues new shares and its earnings stay unchanged, what usually happens to earnings per share?',
      options: ['It increases because there are more shares', 'It decreases due to dilution', 'It is unchanged in every case', 'It becomes the same as book value'],
      correct: 1,
      explanation: 'The same earnings are divided across a larger share count, reducing EPS.',
    },
    {
      id: 'finance-08',
      text: 'Which financial statement reports assets, liabilities, and equity at a point in time?',
      options: ['Income statement', 'Cash flow statement', 'Balance sheet', 'Statement of retained forecasts'],
      correct: 2,
      explanation: 'The balance sheet presents the accounting equation at a specific date.',
    },
    {
      id: 'finance-09',
      text: 'A higher discount rate, with all future cash flows held constant, generally causes present value to:',
      options: ['Increase', 'Decrease', 'Stay equal to face value', 'Become unrelated to timing'],
      correct: 1,
      explanation: 'Future cash flows are discounted more heavily when the discount rate rises.',
    },
    {
      id: 'finance-10',
      text: 'What does a beta of 1.3 typically indicate relative to the market?',
      options: ['The asset has no systematic risk', 'The asset has historically moved about 30% more than the market in sensitivity', 'The asset earns a guaranteed 30% return', 'The asset is risk-free'],
      correct: 1,
      explanation: 'Beta estimates sensitivity to market movements; a beta above one implies higher systematic sensitivity.',
    },
  ],
  'digital-marketing': [
    {
      id: 'digital-marketing-01',
      text: 'Which metric measures the percentage of ad impressions that resulted in a click?',
      options: ['Conversion rate', 'Click-through rate', 'Bounce rate', 'Customer lifetime value'],
      correct: 1,
      explanation: 'CTR is clicks divided by impressions, usually expressed as a percentage.',
    },
    {
      id: 'digital-marketing-02',
      text: 'What is the main purpose of a canonical URL on duplicate or similar pages?',
      options: ['Tell search engines the preferred URL version', 'Increase the page font size', 'Guarantee a first-place ranking', 'Prevent all external links'],
      correct: 0,
      explanation: 'A canonical tag signals which URL should be treated as the preferred version.',
    },
    {
      id: 'digital-marketing-03',
      text: 'In a controlled A/B test, what should differ between the control and variant?',
      options: ['One planned variable at a time', 'Every page element and the audience', 'Only the reporting dashboard', 'The attribution window after results are known'],
      correct: 0,
      explanation: 'Isolating a planned variable helps attribute observed differences to the change.',
    },
    {
      id: 'digital-marketing-04',
      text: 'Which keyword intent most strongly indicates a user is comparing vendors before buying?',
      options: ['Informational', 'Navigational', 'Commercial investigation', 'Purely transactional support'],
      correct: 2,
      explanation: 'Commercial-investigation searches compare products and providers before a purchase decision.',
    },
    {
      id: 'digital-marketing-05',
      text: 'A campaign spends $500 and generates 25 purchases. What is its cost per acquisition?',
      options: ['$5', '$20', '$25', '$475'],
      correct: 1,
      explanation: 'CPA is spend divided by acquisitions: $500 / 25 = $20.',
    },
    {
      id: 'digital-marketing-06',
      text: 'Why use UTM parameters on campaign links?',
      options: ['To identify traffic source and campaign in analytics', 'To improve page load time', 'To change a search result title automatically', 'To encrypt the destination page'],
      correct: 0,
      explanation: 'UTM parameters label campaign traffic for analytics attribution.',
    },
    {
      id: 'digital-marketing-07',
      text: 'Which change is most likely to improve a landing page conversion rate without changing traffic quality?',
      options: ['Make the primary call to action clear and relevant', 'Add unrelated navigation links', 'Remove the offer details', 'Increase ad frequency for the same visitors'],
      correct: 0,
      explanation: 'A clear, relevant CTA reduces ambiguity about the next step.',
    },
    {
      id: 'digital-marketing-08',
      text: 'What is a common limitation of last-click attribution?',
      options: ['It credits the final touchpoint and can undervalue earlier interactions', 'It cannot record any conversions', 'It always double counts every impression', 'It is only applicable to email'],
      correct: 0,
      explanation: 'Last-click models credit the final interaction, omitting earlier influences in a multi-touch journey.',
    },
    {
      id: 'digital-marketing-09',
      text: 'Which action best supports technical SEO for a newly published page?',
      options: ['Ensure it is crawlable and included in the XML sitemap', 'Block it in robots.txt', 'Add the same title as every page', 'Replace internal links with image-only links'],
      correct: 0,
      explanation: 'Search engines need to crawl the page; a sitemap can help discovery.',
    },
    {
      id: 'digital-marketing-10',
      text: 'An email campaign has many opens but very few clicks. Which metric should be examined next to evaluate engagement with its content?',
      options: ['Click-to-open rate', 'Cost per thousand impressions', 'Organic ranking position', 'Inventory turnover'],
      correct: 0,
      explanation: 'Click-to-open rate compares clicks to opens and indicates how often opened emails prompt action.',
    },
  ],
  ai: [
    {
      id: 'ai-01',
      text: 'In supervised learning, what does a labeled training example contain?',
      options: ['Input features and a known target output', 'Only an unlabeled input', 'A model prediction without an input', 'A random optimizer setting'],
      correct: 0,
      explanation: 'Supervised examples pair input data with the target the model should learn to predict.',
    },
    {
      id: 'ai-02',
      text: 'A model performs well on training data but poorly on unseen data. What is the likely issue?',
      options: ['Underfitting', 'Overfitting', 'Feature normalization', 'Stratified sampling'],
      correct: 1,
      explanation: 'Overfitting occurs when a model memorizes training patterns that do not generalize.',
    },
    {
      id: 'ai-03',
      text: 'Which metric is often more informative than accuracy for a highly imbalanced binary classification problem?',
      options: ['Precision and recall', 'Training loss alone', 'Number of model parameters', 'Mean input length'],
      correct: 0,
      explanation: 'Precision and recall reveal positive-class performance that can be hidden by majority-class accuracy.',
    },
    {
      id: 'ai-04',
      text: 'What role does an activation function such as ReLU play in a neural network?',
      options: ['Introduce non-linearity', 'Store the training dataset', 'Guarantee no gradient updates', 'Select the train/test split'],
      correct: 0,
      explanation: 'Non-linear activations allow stacked layers to represent non-linear functions.',
    },
    {
      id: 'ai-05',
      text: 'What is data leakage in machine learning?',
      options: ['Training data is compressed', 'Information unavailable at prediction time influences training or evaluation', 'The model has too few parameters', 'A dataset is split into batches'],
      correct: 1,
      explanation: 'Leakage gives the model information it would not legitimately have at real prediction time.',
    },
    {
      id: 'ai-06',
      text: 'Why is a separate validation set commonly used during model development?',
      options: ['To tune choices without using the final test set for repeated decisions', 'To replace the training data permanently', 'To make all classes equally sized automatically', 'To guarantee a perfect score'],
      correct: 0,
      explanation: 'Validation data supports model selection while keeping the final test set for an unbiased final check.',
    },
    {
      id: 'ai-07',
      text: 'What does temperature mainly control when sampling from a language model?',
      options: ['Randomness of the output distribution', 'The number of training epochs', 'The input context length limit', 'The model’s parameter count'],
      correct: 0,
      explanation: 'Higher temperature generally flattens token probabilities and increases sampling variability.',
    },
    {
      id: 'ai-08',
      text: 'Which practice can reduce unsupported factual claims in a retrieval-augmented generation system?',
      options: ['Ground answers in retrieved sources and allow abstention when evidence is missing', 'Remove source documents from the prompt', 'Increase temperature for every query', 'Hide citations from the model'],
      correct: 0,
      explanation: 'Grounding responses and abstaining when retrieval is insufficient can reduce unsupported claims.',
    },
    {
      id: 'ai-09',
      text: 'What is the purpose of regularization such as L2 weight decay?',
      options: ['Discourage overly large weights to improve generalization', 'Increase the number of labels', 'Convert classification into clustering', 'Ensure every training example is memorized'],
      correct: 0,
      explanation: 'Regularization penalizes model complexity and can reduce overfitting.',
    },
    {
      id: 'ai-10',
      text: 'Before deploying a model for a high-impact decision, which step is most responsible?',
      options: ['Evaluate performance across relevant subgroups and monitor outcomes', 'Use only training accuracy', 'Remove human review regardless of risk', 'Assume benchmark performance applies to every population'],
      correct: 0,
      explanation: 'Subgroup evaluation and post-deployment monitoring help identify performance gaps and changing behavior.',
    },
  ],
}

export const QUESTIONS_PER_TEST = {
  free: 6,
  pro: 10,
} as const
