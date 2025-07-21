// —— 引入后要保证 flatpickr、SignaturePad、supabase-js 已经被 <script> 标签加载 ——

// 1. 初始化 Supabase 客户端
const SUPABASE_URL  = 'https://feidochrncyejojvmxog.supabase.co';
const SUPABASE_ANON = 'sb_publishable_zGi43MB9RNuhAWJ5f-O68A_nLK9HT7u';
const supabase      = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

window.addEventListener('DOMContentLoaded', () => {
  // 2. 英文版日期选择器
  flatpickr('#date-of-birth', {
    dateFormat: 'Y-m-d',
    locale: 'default'  // 默认就是英文
  });

  // 3. 初始化 SignaturePad
  const canvas = document.getElementById('sig-canvas');
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  const pad = new SignaturePad(canvas);

  // 4. 绑定 DOM 元素
  const form   = document.getElementById('sign-form');
  const full   = document.getElementById('full-name');
  const dob    = document.getElementById('date-of-birth');
  const mob    = document.getElementById('mobile');
  const mail   = document.getElementById('email');
  const amt    = document.getElementById('opening-amount');
  const occ    = document.getElementById('occupation');
  const addr   = document.getElementById('residential-address');
  const clear  = document.getElementById('clear-btn');
  const submit = document.getElementById('submit-btn');
  const status = document.getElementById('status');

  // 清除签名和状态
  clear.addEventListener('click', () => {
    pad.clear();
    status.textContent = '';
  });

  // 提交数据
  submit.addEventListener('click', async () => {
    if (pad.isEmpty()) {
      alert('Please sign first!');
      return;
    }
    submit.disabled = true;
    status.textContent = 'Submitting...';

    try {
      // 导出 Base64 签名图
      const signatureData = pad.toDataURL('image/png');

      // 组装插入的记录
      const payload = {
        full_name:           full.value.trim(),
        date_of_birth:       dob.value || null,
        mobile:              mob.value.trim(),
        email:               mail.value.trim(),
        opening_amount:      amt.value || null,
        occupation:          occ.value.trim(),
        residential_address: addr.value.trim(),
        signature_data:      signatureData
      };

      // 插入 Supabase
      const { error } = await supabase
        .from('signatures')
        .insert([ payload ]);

      if (error) throw error;

      status.textContent = 'Submit success!';
      alert('Submit success!');
      pad.clear();
      form.reset();
    } catch (err) {
      console.error(err);
      alert('Submit failed: ' + err.message);
      status.textContent = '';
    } finally {
      submit.disabled = false;
    }
  });
});
