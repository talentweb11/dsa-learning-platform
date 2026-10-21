"""Source fixtures for the original curriculum. Regenerate JSON with Python 3."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
items = []
def add(id, title, difficulty, topics, description, samples, private, hints, explanation, complexity, solutions, blanks):
    items.append(dict(id=id,title=title,difficulty=difficulty,topicTags=topics,description=description,samples=samples,private=private,hints=hints,explanation=explanation,complexity=complexity,solutions=solutions,blanks=blanks))

add('running-totals','Running totals','Easy',['Arrays'],
    'A trail log records the distance covered on each segment. Return an array whose entry at each index is the total distance recorded up to and including that segment. Negative entries represent corrections. The target parameter is unused.',
    [([2,4,1,3],0,[2,6,7,10]), ([],0,[])], [([-2,5,-1],0,[-2,3,2]),([0],0,[0])],
    ['Keep a running total as you move from left to right.','Add the current value to the total before appending it.'],
    'Maintain the sum of the prefix already visited. Each new value extends that prefix by one element, so each output is produced in constant time.', 'O(n) time · O(n) output space',
    ['total = 0\nresult = []\nfor value in numbers:\n    total += value\n    result.append(total)\nreturn result',
     'int[] result = new int[numbers.length];\nint total = 0;\nfor (int i = 0; i < numbers.length; i++) {\n    total += numbers[i];\n    result[i] = total;\n}\nreturn result;',
     'vector<int> result;\nint total = 0;\nfor (int value : numbers) {\n    total += value;\n    result.push_back(total);\n}\nreturn result;',
     'let total = 0;\nconst result = [];\nfor (const value of numbers) {\n  total += value;\n  result.push(total);\n}\nreturn result;'],
    ['total += value','total += numbers[i];','total += value;','total += value;'])

add('highest-reading','Highest reading','Easy',['Arrays'],
    'Given a nonempty list of sensor readings, return the greatest reading inside a one-element array. Readings may all be negative, so do not assume that zero is a valid starting maximum. The target parameter is unused.',
    [([3,9,4,2],0,[9]),([-8,-3,-10],0,[-3])], [([7],0,[7]),([-1,0,6,6],0,[6])],
    ['Initialize your best reading from the input itself.','Compare each reading with the best value seen so far.'],
    'The running maximum is the greatest value in the visited prefix. After the last comparison it is the greatest value in the whole list.', 'O(n) time · O(1) extra space',
    ['best = numbers[0]\nfor value in numbers:\n    best = max(best, value)\nreturn [best]',
     'int best = numbers[0];\nfor (int value : numbers) best = Math.max(best, value);\nreturn new int[]{best};',
     'int best = numbers[0];\nfor (int value : numbers) best = max(best, value);\nreturn {best};',
     'let best = numbers[0];\nfor (const value of numbers) best = Math.max(best, value);\nreturn [best];'],
    ['max(best, value)','Math.max(best, value)','max(best, value)','Math.max(best, value)'])

add('count-matches','Count the matches','Easy',['Arrays','Hash maps'],
    'A scanner records a sequence of numeric labels. Count how many labels equal target and return the count in a one-element array. An empty sequence has zero matching labels.',
    [([4,2,4,4],4,[3]),([],3,[0])], [([1,2,3],9,[0]),([-2,-2,1],-2,[2])],
    ['Start a counter at zero.','Only increment the counter when the current value equals target.'],
    'Inspect every element exactly once. The counter tracks how many matching elements occur in the prefix visited so far.', 'O(n) time · O(1) extra space',
    ['count = 0\nfor value in numbers:\n    if value == target:\n        count += 1\nreturn [count]',
     'int count = 0;\nfor (int value : numbers) if (value == target) count++;\nreturn new int[]{count};',
     'int count = 0;\nfor (int value : numbers) if (value == target) count++;\nreturn {count};',
     'let count = 0;\nfor (const value of numbers) if (value === target) count++;\nreturn [count];'],
    ['value == target','value == target','value == target','value === target'])

add('unique-stops','Unique stops','Easy',['Two pointers','Sorting'],
    'A route contains stop numbers already sorted in nondecreasing order. Return the distinct stop numbers in the same order. Consecutive repeats should appear only once in your result. The target parameter is unused.',
    [([1,1,2,4,4],0,[1,2,4]),([],0,[])], [([-3,-3,0,2],0,[-3,0,2]),([5,5,5],0,[5])],
    ['Sorted duplicates always sit next to one another.','Append a value if the output is empty or its last value is different.'],
    'Because the list is sorted, comparing a value with the most recently emitted value is enough to remove every duplicate.', 'O(n) time · O(n) output space',
    ['result = []\nfor value in numbers:\n    if not result or result[-1] != value:\n        result.append(value)\nreturn result',
     'ArrayList<Integer> result = new ArrayList<>();\nfor (int value : numbers) {\n    if (result.isEmpty() || result.get(result.size()-1) != value) result.add(value);\n}\nreturn result.stream().mapToInt(Integer::intValue).toArray();',
     'vector<int> result;\nfor (int value : numbers) {\n    if (result.empty() || result.back() != value) result.push_back(value);\n}\nreturn result;',
     'const result = [];\nfor (const value of numbers) {\n  if (!result.length || result[result.length-1] !== value) result.push(value);\n}\nreturn result;'],
    ['result[-1] != value','result.get(result.size()-1) != value','result.back() != value','result[result.length-1] !== value'])

add('pair-budget','Pair a budget','Easy',['Hash maps','Arrays'],
    'Choose two different entries whose sum equals target. Scan the second index from left to right and return the earliest matching pair as [firstIndex, secondIndex], using the earliest first index for that second index. Return [] if no pair exists. Indices start at zero.',
    [([3,8,5,2],10,[1,3]),([4,4],8,[0,1])], [([1,2,3],8,[]),([2,2,5],7,[0,2]),([-2,5,3],1,[0,2])],
    ['For each value, ask whether target minus that value has already appeared.','Store the first index for each value. Check for a complement before storing the current index.'],
    'A hash map stores the earliest index of every visited value. Checking before insertion prevents an element from pairing with itself and ensures the required ordering.', 'O(n) expected time · O(n) space',
    ['seen = {}\nfor i, value in enumerate(numbers):\n    need = target - value\n    if need in seen:\n        return [seen[need], i]\n    if value not in seen:\n        seen[value] = i\nreturn []',
     'Map<Integer,Integer> seen = new HashMap<>();\nfor (int i=0; i<numbers.length; i++) {\n    int need = target - numbers[i];\n    if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n    seen.putIfAbsent(numbers[i], i);\n}\nreturn new int[]{};',
     'unordered_map<int,int> seen;\nfor (int i=0; i<(int)numbers.size(); i++) {\n    int need = target - numbers[i];\n    if (seen.count(need)) return {seen[need], i};\n    if (!seen.count(numbers[i])) seen[numbers[i]] = i;\n}\nreturn {};',
     'const seen = new Map();\nfor (let i=0; i<numbers.length; i++) {\n  const need = target - numbers[i];\n  if (seen.has(need)) return [seen.get(need), i];\n  if (!seen.has(numbers[i])) seen.set(numbers[i], i);\n}\nreturn [];'],
    ['target - value','target - numbers[i]','target - numbers[i]','target - numbers[i]'])

add('insertion-point','Find the insertion point','Medium',['Binary search'],
    'Given a sorted list, return the first index whose value is at least target. If every value is smaller, return the list length. Put the index in a one-element array. Repeated values are allowed.',
    [([1,3,3,7],3,[1]),([2,4],9,[2])], [([],1,[0]),([5,5],4,[0]),([-4,0,8],1,[2])],
    ['Search a half-open interval [left, right).','If the middle value is smaller than target, all positions through middle are too small.'],
    'Maintain the lower bound in a half-open interval. A comparison discards half the remaining positions, and left equals the first valid insertion index at termination.', 'O(log n) time · O(1) space',
    ['left, right = 0, len(numbers)\nwhile left < right:\n    mid = (left + right) // 2\n    if numbers[mid] < target:\n        left = mid + 1\n    else:\n        right = mid\nreturn [left]',
     'int left=0, right=numbers.length;\nwhile (left < right) {\n    int mid = left + (right-left)/2;\n    if (numbers[mid] < target) left=mid+1;\n    else right=mid;\n}\nreturn new int[]{left};',
     'int left=0, right=numbers.size();\nwhile (left < right) {\n    int mid = left + (right-left)/2;\n    if (numbers[mid] < target) left=mid+1;\n    else right=mid;\n}\nreturn {left};',
     'let left=0, right=numbers.length;\nwhile (left < right) {\n  const mid = Math.floor((left+right)/2);\n  if (numbers[mid] < target) left=mid+1;\n  else right=mid;\n}\nreturn [left];'],
    ['mid + 1','mid+1','mid+1','mid+1'])

add('rotate-log','Rotate the log','Medium',['Arrays','Two pointers'],
    'Move each entry in a log target positions to the right, wrapping entries that pass the end back to the start. Return the rotated array without changing its length. target is nonnegative; an empty log remains empty.',
    [([1,2,3,4,5],2,[4,5,1,2,3]),([],3,[])], [([1,2,3],4,[3,1,2]),([8],0,[8])],
    ['Large rotation counts can be reduced modulo the list length.','The entry at i moves to (i + target) modulo length.'],
    'Assign each value to its wrapped destination in a fresh array. Modulo makes the destination valid for rotation counts larger than the array.', 'O(n) time · O(n) space',
    ['n = len(numbers)\nif n == 0:\n    return []\nresult = [0] * n\nfor i, value in enumerate(numbers):\n    result[(i + target) % n] = value\nreturn result',
     'int n=numbers.length;\nint[] result=new int[n];\nfor (int i=0; i<n; i++) result[(i+target)%n]=numbers[i];\nreturn result;',
     'int n=numbers.size();\nvector<int> result(n);\nfor (int i=0; i<n; i++) result[(i+target)%n]=numbers[i];\nreturn result;',
     'const n=numbers.length;\nconst result=new Array(n);\nfor (let i=0; i<n; i++) result[(i+target)%n]=numbers[i];\nreturn result;'],
    ['(i + target) % n','(i+target)%n','(i+target)%n','(i+target)%n'])

add('best-streak','Best continuous streak','Medium',['Dynamic programming','Arrays'],
    'Daily score changes may be positive or negative. Find the largest sum of any nonempty contiguous segment and return it in a one-element array. The input is nonempty and target is unused.',
    [([-2,3,-1,4,-5],0,[6]),([-5,-2,-8],0,[-2])], [([4],0,[4]),([0,2,-1,2],0,[3])],
    ['Track the best sum ending exactly at the current entry.','Either extend the previous segment or begin a new segment with the current value.'],
    'The best segment ending at an index either starts there or extends the previous best ending segment. Track the largest such sum across all indices.', 'O(n) time · O(1) space',
    ['ending = best = numbers[0]\nfor value in numbers[1:]:\n    ending = max(value, ending + value)\n    best = max(best, ending)\nreturn [best]',
     'int ending=numbers[0], best=ending;\nfor (int i=1; i<numbers.length; i++) {\n    ending=Math.max(numbers[i], ending+numbers[i]);\n    best=Math.max(best, ending);\n}\nreturn new int[]{best};',
     'int ending=numbers[0], best=ending;\nfor (int i=1; i<(int)numbers.size(); i++) {\n    ending=max(numbers[i], ending+numbers[i]);\n    best=max(best, ending);\n}\nreturn {best};',
     'let ending=numbers[0], best=ending;\nfor (let i=1; i<numbers.length; i++) {\n  ending=Math.max(numbers[i], ending+numbers[i]);\n  best=Math.max(best, ending);\n}\nreturn [best];'],
    ['max(value, ending + value)','Math.max(numbers[i], ending+numbers[i])','max(numbers[i], ending+numbers[i])','Math.max(numbers[i], ending+numbers[i])'])

add('next-warmer','Next higher reading','Medium',['Stacks'],
    'For each reading, report the first strictly greater reading somewhere to its right, or -1 if none exists. Return values, not distances or indices. Equal readings do not count as greater. target is unused.',
    [([2,1,4,3],0,[4,4,-1,-1]),([3,3],0,[-1,-1])], [([],0,[]),([1,2,3],0,[2,3,-1]),([5,4,2],0,[-1,-1,-1])],
    ['Scan from right to left and keep a stack of candidate readings.','Remove candidates that are less than or equal to the current reading.'],
    'A monotonic stack discards values hidden by a nearer, greater value. Each reading is pushed once and popped at most once.', 'O(n) time · O(n) space',
    ['result = [-1] * len(numbers)\nstack = []\nfor i in range(len(numbers)-1, -1, -1):\n    while stack and stack[-1] <= numbers[i]:\n        stack.pop()\n    if stack:\n        result[i] = stack[-1]\n    stack.append(numbers[i])\nreturn result',
     'int[] result=new int[numbers.length];\nArrays.fill(result,-1);\nDeque<Integer> stack=new ArrayDeque<>();\nfor (int i=numbers.length-1; i>=0; i--) {\n    while (!stack.isEmpty() && stack.peek() <= numbers[i]) stack.pop();\n    if (!stack.isEmpty()) result[i]=stack.peek();\n    stack.push(numbers[i]);\n}\nreturn result;',
     'vector<int> result(numbers.size(),-1), stack;\nfor (int i=(int)numbers.size()-1; i>=0; i--) {\n    while (!stack.empty() && stack.back() <= numbers[i]) stack.pop_back();\n    if (!stack.empty()) result[i]=stack.back();\n    stack.push_back(numbers[i]);\n}\nreturn result;',
     'const result=new Array(numbers.length).fill(-1), stack=[];\nfor (let i=numbers.length-1; i>=0; i--) {\n  while (stack.length && stack[stack.length-1] <= numbers[i]) stack.pop();\n  if (stack.length) result[i]=stack[stack.length-1];\n  stack.push(numbers[i]);\n}\nreturn result;'],
    ['stack[-1] <= numbers[i]','stack.peek() <= numbers[i]','stack.back() <= numbers[i]','stack[stack.length-1] <= numbers[i]'])

add('exact-segments','Count exact segments','Medium',['Hash maps','Arrays'],
    'Count the nonempty contiguous segments whose entries sum to target. Return the number of segments inside a one-element array. Entries can be negative or zero, so a positive-only sliding window is not sufficient.',
    [([1,2,1,2],3,[3]),([0,0],0,[3])], [([-1,1,0],0,[3]),([],2,[0]),([2,2,2],4,[2])],
    ['A segment sum is the difference of two prefix sums.','Count earlier prefixes equal to the current prefix minus target. Include the empty prefix.'],
    'Store a frequency map of earlier prefix sums, initially containing zero once. Each matching earlier prefix defines one segment ending at the current index.', 'O(n) expected time · O(n) space',
    ['counts = {0: 1}\nprefix = result = 0\nfor value in numbers:\n    prefix += value\n    result += counts.get(prefix - target, 0)\n    counts[prefix] = counts.get(prefix, 0) + 1\nreturn [result]',
     'Map<Integer,Integer> counts=new HashMap<>();\ncounts.put(0,1);\nint prefix=0, result=0;\nfor (int value:numbers) {\n    prefix+=value;\n    result+=counts.getOrDefault(prefix-target,0);\n    counts.put(prefix,counts.getOrDefault(prefix,0)+1);\n}\nreturn new int[]{result};',
     'unordered_map<int,int> counts;\ncounts[0]=1;\nint prefix=0, result=0;\nfor (int value:numbers) {\n    prefix+=value;\n    result+=counts[prefix-target];\n    counts[prefix]++;\n}\nreturn {result};',
     'const counts=new Map([[0,1]]);\nlet prefix=0, result=0;\nfor (const value of numbers) {\n  prefix+=value;\n  result+=counts.get(prefix-target) || 0;\n  counts.set(prefix,(counts.get(prefix)||0)+1);\n}\nreturn [result];'],
    ['prefix - target','prefix-target','prefix-target','prefix-target'])

add('window-peaks','Moving window peaks','Hard',['Sliding window','Queues'],
    'A window of target consecutive readings moves one position at a time across the input. Return the maximum in every window, from left to right. The input is nonempty and target is between 1 and its length. Aim for linear time.',
    [([1,3,-1,-3,5,3,6,7],3,[3,3,5,5,6,7]),([4,2],1,[4,2])], [([2,2,2],2,[2,2]),([-3,-1,-2],3,[-1])],
    ['Keep candidate indices in a deque with decreasing values.','Expire indices outside the window, then remove smaller values from the back.'],
    'A decreasing deque keeps the maximum at the front. Expired indices leave the front and dominated values leave the back. Each index enters and leaves at most once.', 'O(n) time · O(n) allocated space',
    ['from collections import deque\nq = deque()\nresult = []\nfor i, value in enumerate(numbers):\n    while q and q[0] <= i - target:\n        q.popleft()\n    while q and numbers[q[-1]] <= value:\n        q.pop()\n    q.append(i)\n    if i >= target - 1:\n        result.append(numbers[q[0]])\nreturn result',
     'Deque<Integer> q=new ArrayDeque<>();\nint[] result=new int[numbers.length-target+1];\nfor (int i=0; i<numbers.length; i++) {\n    while (!q.isEmpty() && q.peekFirst() <= i-target) q.removeFirst();\n    while (!q.isEmpty() && numbers[q.peekLast()] <= numbers[i]) q.removeLast();\n    q.addLast(i);\n    if (i>=target-1) result[i-target+1]=numbers[q.peekFirst()];\n}\nreturn result;',
     'deque<int> q;\nvector<int> result;\nfor (int i=0; i<(int)numbers.size(); i++) {\n    while (!q.empty() && q.front() <= i-target) q.pop_front();\n    while (!q.empty() && numbers[q.back()] <= numbers[i]) q.pop_back();\n    q.push_back(i);\n    if (i>=target-1) result.push_back(numbers[q.front()]);\n}\nreturn result;',
     'const q=[], result=[];\nlet head=0;\nfor (let i=0; i<numbers.length; i++) {\n  while (head<q.length && q[head] <= i-target) head++;\n  while (head<q.length && numbers[q[q.length-1]] <= numbers[i]) q.pop();\n  q.push(i);\n  if (i>=target-1) result.push(numbers[q[head]]);\n}\nreturn result;'],
    ['i - target','i-target','i-target','i-target'])

add('rain-reservoir','Rain between ridges','Hard',['Two pointers','Arrays'],
    'Nonnegative integers describe unit-width ridge heights. Return the total units of water held between ridges after rain, in a one-element array. Water escapes at both ends. target is unused.',
    [([3,0,2,0,4],0,[7]),([1,2,3],0,[0])], [([],0,[0]),([4,1,1,4],0,[6]),([2,0,2],0,[2])],
    ['Water above a position is limited by the lower of its left and right boundaries.','Move the side with the smaller current height, maintaining the best boundary on that side.'],
    'At the lower side, the opposite boundary is already high enough to settle the water level. Updating the boundary and moving inward computes each position once.', 'O(n) time · O(1) space',
    ['left, right = 0, len(numbers)-1\nlmax = rmax = water = 0\nwhile left <= right:\n    if numbers[left] <= numbers[right]:\n        lmax = max(lmax, numbers[left])\n        water += lmax - numbers[left]\n        left += 1\n    else:\n        rmax = max(rmax, numbers[right])\n        water += rmax - numbers[right]\n        right -= 1\nreturn [water]',
     'int left=0,right=numbers.length-1,lmax=0,rmax=0,water=0;\nwhile (left<=right) {\n    if (numbers[left]<=numbers[right]) {\n        lmax=Math.max(lmax,numbers[left]);\n        water+=lmax-numbers[left++];\n    } else {\n        rmax=Math.max(rmax,numbers[right]);\n        water+=rmax-numbers[right--];\n    }\n}\nreturn new int[]{water};',
     'int left=0,right=(int)numbers.size()-1,lmax=0,rmax=0,water=0;\nwhile (left<=right) {\n    if (numbers[left]<=numbers[right]) {\n        lmax=max(lmax,numbers[left]);\n        water+=lmax-numbers[left++];\n    } else {\n        rmax=max(rmax,numbers[right]);\n        water+=rmax-numbers[right--];\n    }\n}\nreturn {water};',
     'let left=0,right=numbers.length-1,lmax=0,rmax=0,water=0;\nwhile (left<=right) {\n  if (numbers[left]<=numbers[right]) {\n    lmax=Math.max(lmax,numbers[left]);\n    water+=lmax-numbers[left++];\n  } else {\n    rmax=Math.max(rmax,numbers[right]);\n    water+=rmax-numbers[right--];\n  }\n}\nreturn [water];'],
    ['lmax - numbers[left]','lmax-numbers[left++]','lmax-numbers[left++]','lmax-numbers[left++]'])

add('rising-chain','Longest rising chain','Hard',['Dynamic programming','Binary search'],
    'Choose entries in their original order, optionally skipping entries, to form a strictly increasing sequence. Return the greatest possible length in a one-element array. Equal values cannot extend a chain. target is unused. Aim for O(n log n) time.',
    [([7,2,5,3,6,4,9],0,[4]),([2,2,2],0,[1])], [([],0,[0]),([5,4,3],0,[1]),([1,3,2,4,5],0,[4])],
    ['Track the smallest possible ending value for each chain length.','Use lower-bound binary search to replace the first tail at least as large as the current value.'],
    'Smaller tails leave more opportunities to extend a sequence. Replacing a tail preserves existing chain lengths; appending creates a longer chain. Binary search locates the correct tail.', 'O(n log n) time · O(n) space',
    ['from bisect import bisect_left\ntails = []\nfor value in numbers:\n    i = bisect_left(tails, value)\n    if i == len(tails):\n        tails.append(value)\n    else:\n        tails[i] = value\nreturn [len(tails)]',
     'int[] tails=new int[numbers.length];\nint size=0;\nfor (int value:numbers) {\n    int left=0,right=size;\n    while(left<right) {\n        int mid=(left+right)/2;\n        if(tails[mid]<value) left=mid+1; else right=mid;\n    }\n    tails[left]=value;\n    if(left==size) size++;\n}\nreturn new int[]{size};',
     'vector<int> tails;\nfor(int value:numbers) {\n    auto it=lower_bound(tails.begin(),tails.end(),value);\n    if(it==tails.end()) tails.push_back(value);\n    else *it=value;\n}\nreturn {(int)tails.size()};',
     'const tails=[];\nfor(const value of numbers) {\n  let left=0,right=tails.length;\n  while(left<right) {\n    const mid=Math.floor((left+right)/2);\n    if(tails[mid]<value) left=mid+1; else right=mid;\n  }\n  tails[left]=value;\n}\nreturn [tails.length];'],
    ['bisect_left(tails, value)','tails[mid]<value','lower_bound(tails.begin(),tails.end(),value)','tails[mid]<value'])

add('merge-bookings','Merge overlapping bookings','Hard',['Sorting','Arrays'],
    'Bookings are supplied as a flat array [start1, end1, start2, end2, ...]. Merge overlapping or touching closed intervals. Return the merged intervals in the same flat format, sorted by start time. Each start is at most its end; the number of entries is even. target is unused.',
    [([5,8,1,3,2,6,10,12],0,[1,8,10,12]),([1,2,2,4],0,[1,4])], [([],0,[]),([1,9,3,4],0,[1,9]),([5,5,1,1],0,[1,1,5,5])],
    ['Sort the intervals by their start, keeping each pair together.','Compare each start with the last merged end. Extend the end when they overlap.'],
    'After sorting, an interval can only overlap the most recent merged interval. Extending that interval or emitting a new one covers every input without gaps.', 'O(n log n) time · O(n) space',
    ['pairs = sorted(zip(numbers[::2], numbers[1::2]))\nresult = []\nfor start, end in pairs:\n    if result and start <= result[-1]:\n        result[-1] = max(result[-1], end)\n    else:\n        result.extend([start, end])\nreturn result',
     'int[][] pairs=new int[numbers.length/2][2];\nfor(int i=0;i<pairs.length;i++) pairs[i]=new int[]{numbers[2*i],numbers[2*i+1]};\nArrays.sort(pairs,Comparator.comparingInt(a -> a[0]));\nArrayList<Integer> result=new ArrayList<>();\nfor(int[] p:pairs) {\n    int n=result.size();\n    if(n>0 && p[0]<=result.get(n-1)) result.set(n-1,Math.max(result.get(n-1),p[1]));\n    else {result.add(p[0]);result.add(p[1]);}\n}\nreturn result.stream().mapToInt(Integer::intValue).toArray();',
     'vector<pair<int,int>> pairs;\nfor(int i=0;i<(int)numbers.size();i+=2) pairs.push_back({numbers[i],numbers[i+1]});\nsort(pairs.begin(),pairs.end());\nvector<int> result;\nfor(auto p:pairs) {\n    if(!result.empty() && p.first<=result.back()) result.back()=max(result.back(),p.second);\n    else {result.push_back(p.first);result.push_back(p.second);}\n}\nreturn result;',
     'const pairs=[];\nfor(let i=0;i<numbers.length;i+=2) pairs.push([numbers[i],numbers[i+1]]);\npairs.sort((a,b)=>a[0]-b[0]);\nconst result=[];\nfor(const [start,end] of pairs) {\n  if(result.length && start<=result[result.length-1]) result[result.length-1]=Math.max(result[result.length-1],end);\n  else result.push(start,end);\n}\nreturn result;'],
    ['start <= result[-1]','p[0]<=result.get(n-1)','p.first<=result.back()','start<=result[result.length-1]'])

add('fewest-hops','Fewest forward hops','Hard',['Graphs','Dynamic programming'],
    'Each nonnegative entry gives the maximum forward hop length from that position. Starting at index zero, return the fewest hops needed to reach the final index, in a one-element array. Return [-1] if it cannot be reached. A one-entry input requires zero hops; input is nonempty. target is unused.',
    [([2,3,1,1,4],0,[2]),([1,0,2],0,[-1])], [([0],0,[0]),([3,0,0,1],0,[1]),([1,1,1,1],0,[3])],
    ['Think of each jump count as a breadth-first-search layer of reachable indices.','Track the end of the current layer and the farthest position reachable from it.'],
    'Scanning one reachable layer at a time is equivalent to breadth-first search on the implicit forward-edge graph. Crossing a layer boundary adds one hop. A layer that cannot extend means the end is unreachable.', 'O(n) time · O(1) space',
    ['end = farthest = hops = 0\nfor i in range(len(numbers)-1):\n    farthest = max(farthest, i + numbers[i])\n    if i == end:\n        if farthest <= i:\n            return [-1]\n        hops += 1\n        end = farthest\n        if end >= len(numbers)-1:\n            return [hops]\nreturn [hops]',
     'int end=0,farthest=0,hops=0;\nfor(int i=0;i<numbers.length-1;i++) {\n    farthest=Math.max(farthest,i+numbers[i]);\n    if(i==end) {\n        if(farthest<=i) return new int[]{-1};\n        hops++;end=farthest;\n        if(end>=numbers.length-1) return new int[]{hops};\n    }\n}\nreturn new int[]{hops};',
     'int end=0,farthest=0,hops=0;\nfor(int i=0;i<(int)numbers.size()-1;i++) {\n    farthest=max(farthest,i+numbers[i]);\n    if(i==end) {\n        if(farthest<=i) return {-1};\n        hops++;end=farthest;\n        if(end>=(int)numbers.size()-1) return {hops};\n    }\n}\nreturn {hops};',
     'let end=0,farthest=0,hops=0;\nfor(let i=0;i<numbers.length-1;i++) {\n  farthest=Math.max(farthest,i+numbers[i]);\n  if(i===end) {\n    if(farthest<=i) return [-1];\n    hops++;end=farthest;\n    if(end>=numbers.length-1) return [hops];\n  }\n}\nreturn [hops];'],
    ['i + numbers[i]','i+numbers[i]','i+numbers[i]','i+numbers[i]'])

langs=['python','java','cpp','javascript']
signatures=['def solve(numbers: list[int], target: int) -> list[int]:','public int[] solve(int[] numbers, int target)','vector<int> solve(vector<int> numbers, int target)','function solve(numbers, target)']
def wrap(body,lang):
    indent=lambda s,n: '\n'.join(' '*n+line for line in s.splitlines())
    if lang=='python': return signatures[0]+'\n'+indent(body,4)+'\n'
    if lang=='java': return 'class Solution {\n    '+signatures[1]+' {\n'+indent(body,8)+'\n    }\n}\n'
    return signatures[langs.index(lang)]+' {\n'+indent(body,4)+'\n}\n'
def case(t): return dict(input=dict(numbers=t[0],target=t[1]),expected=t[2])
public=[]; private={}; refs={}
for item in items:
    pid=item['id']; fixtures={}; refs[pid]={}
    for i,lang in enumerate(langs):
        body=item['solutions'][i]; blank=item['blanks'][i]
        assert blank in body
        minimal='raise NotImplementedError("Write your solution")' if lang=='python' else ('throw new UnsupportedOperationException("Write your solution");' if lang=='java' else ('throw runtime_error("Write your solution");' if lang=='cpp' else 'throw new Error("Write your solution");'))
        fixtures[lang]=dict(functionSignature=signatures[i],starterCode=wrap(minimal,lang),guidedCode=wrap(body.replace(blank,'___',1),lang),guidedBlanks=['Replace ___ with the missing expression or statement.'],runnerTemplate='integer-array-v1')
        refs[pid][lang]=wrap(body,lang)
    constraints=['0 ≤ numbers.length ≤ 1,000','Each value and target is an integer between -1,000 and 1,000.','Return an array of integers; do not print the answer.','Additional input conditions are stated in the task description.']
    public.append({k:item[k] for k in ['id','title','difficulty','topicTags','description','hints','explanation','complexity']} | dict(slug=pid,modes=['guided','unguided'],constraints=constraints,supportedLanguages=langs,perLanguage=fixtures,examples=[case(item['samples'][0])],publicTests=list(map(case,item['samples']))))
    private[pid]=list(map(case,item['private']))
for path,data in [('src/content/problems.json',public),('src/content/solutions.json',refs),('server/content/private-tests.json',private)]:
    p=ROOT/path; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(public)} problems / {len(public)*2} mode variants in four languages.')
